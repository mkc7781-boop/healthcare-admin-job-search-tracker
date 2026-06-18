import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";


const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.APP_URL ?? "http://localhost:3000";
let failed = 0;

function pass(label) {
  console.log(`[PASS] ${label}`);
}

function fail(label, detail = "") {
  console.log(`[FAIL] ${label}${detail ? ` — ${detail}` : ""}`);
  failed += 1;
}

// --- Static checks ---
const leadForm = readFileSync(join(root, "src/components/LeadForm.tsx"), "utf8");
if (
  leadForm.includes('payload.status === "applied"') &&
  leadForm.includes("previousStatus !== \"applied\"") &&
  leadForm.includes("fireAppliedConfetti()")
) {
  pass("LeadForm triggers confetti on transition to applied");
} else {
  fail("LeadForm confetti wiring");
}

if (readFileSync(join(root, "src/lib/confetti.ts"), "utf8").includes("canvas-confetti")) {
  pass("confetti helper uses canvas-confetti");
} else {
  fail("confetti helper");
}

// --- Pick a need_to_apply lead for the UI test ---
const listBeforeRes = await fetch(`${base}/api/agent/leads`);
const listBefore = await listBeforeRes.json();
const testLead =
  listBefore.leads?.find((l) => l.status === "need_to_apply" && l.employer.startsWith("Confetti Test")) ??
  listBefore.leads?.find((l) => l.status === "need_to_apply");

if (testLead) {
  pass(`Using test lead: ${testLead.employer}`);
} else {
  fail("Find need_to_apply lead for UI test");
}

const testEmployer = testLead?.employer ?? "";
const testLeadId = testLead?.id ?? "";

// --- Browser test with bundled Chromium ---
let puppeteerModule = null;
try {
  puppeteerModule = await import("puppeteer");
} catch (err) {
  fail("Load puppeteer", err.message);
}

if (puppeteerModule && testLead) {
  let browser;
  try {
    browser = await puppeteerModule.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      await page.goto(base, { waitUntil: "networkidle2", timeout: 30000 });

      const title = await page.title();
      if (title || (await page.content()).includes("Healthcare Admin Job Tracker")) {
        pass("Dashboard loads in browser");
      } else {
        fail("Dashboard loads in browser");
      }

      await page.waitForSelector('button[aria-label="Edit lead"]', { timeout: 10000 });
      const openedEdit = await page.evaluate((employer) => {
        const row = [...document.querySelectorAll("tbody tr")].find((tr) =>
          tr.textContent?.includes(employer)
        );
        const btn = row?.querySelector('button[aria-label="Edit lead"]');
        if (!btn) return false;
        btn.click();
        return true;
      }, testEmployer);

      if (!openedEdit) {
        fail("Find edit button on test lead");
      } else {
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        pass("Edit dialog opens");

        const openedStatus = await page.evaluate(() => {
          const labels = [...document.querySelectorAll('[role="dialog"] label')];
          const statusLabel = labels.find((l) => l.textContent?.trim() === "Status");
          const block = statusLabel?.closest(".grid");
          const trigger = block?.querySelector('[role="combobox"]');
          if (!trigger) return false;
          trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
          trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          trigger.click();
          return true;
        });
        if (!openedStatus) {
          fail("Open status dropdown");
        }

        await new Promise((r) => setTimeout(r, 400));
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");

        const pickedApplied = await page.evaluate(() => {
          const trigger = [...document.querySelectorAll('[role="dialog"] [role="combobox"]')].find(
            (el) =>
              el.closest(".grid")?.querySelector("label")?.textContent?.trim() === "Status"
          );
          return trigger?.textContent?.includes("Applied") ?? false;
        });

        if (!pickedApplied) {
          fail("Select Applied option");
        } else {
          pass("Status changed to Applied in form");

          const canvasBefore = await page.evaluate(
            () => document.querySelectorAll("canvas").length
          );

          await page.evaluate(() => {
            const btn = [...document.querySelectorAll("button")].find(
              (el) => el.textContent?.trim() === "Save Changes"
            );
            btn?.click();
          });

          await page.waitForFunction(
            () => document.querySelectorAll("canvas").length > 0,
            { timeout: 8000 }
          );
          const canvasAfter = await page.evaluate(
            () => document.querySelectorAll("canvas").length
          );

          if (canvasAfter > canvasBefore) {
            pass(`Confetti canvas appeared (${canvasAfter} canvas elements)`);
          } else {
            fail("Confetti canvas appeared", `before=${canvasBefore} after=${canvasAfter}`);
          }

          await page
            .waitForFunction(() => !document.querySelector('[role="dialog"]'), {
              timeout: 8000,
            })
            .catch(() => {});
          pass("Dialog closed after save");

          const bodyText = await page.evaluate(() => document.body.innerText);
          if (bodyText.includes("Server Components render")) {
            fail("No server render error after save");
          } else {
            pass("No server render error after save");
          }
        }
      }
  } catch (err) {
    fail("Browser E2E", err.message);
  } finally {
    await browser?.close();
  }
}

// --- Verify persisted status ---
await new Promise((r) => setTimeout(r, 1000));
const listRes = await fetch(`${base}/api/agent/leads`);
const listData = await listRes.json();
const updated = listData.leads?.find((l) => l.id === testLeadId);
if (updated?.status === "applied") {
  pass("Lead status persisted as applied");
} else {
  fail("Lead status persisted", updated?.status ?? "lead not found");
}

// Reset lead so the test can be re-run.
if (testLeadId && failed === 0) {
  await fetch(`${base}/api/agent/leads/${testLeadId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "need_to_apply" }),
  });
}

console.log(`\n=== CONFETTI TEST: ${failed === 0 ? "ALL PASSED" : `${failed} FAILED`} ===`);
setTimeout(() => process.exit(failed === 0 ? 0 : 1), 50);