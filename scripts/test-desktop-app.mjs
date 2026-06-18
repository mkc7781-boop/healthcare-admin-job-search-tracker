import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.APP_URL ?? "http://localhost:3000";
const debugPort = process.env.ELECTRON_REMOTE_DEBUG ?? "9333";
const electronExe = join(
  root,
  "installers",
  "windows",
  "node_modules",
  "electron",
  "dist",
  "electron.exe"
);
const mainJs = join(root, "installers", "windows", "main.js");
const packagedExe = join(
  root,
  "installers",
  "windows",
  "dist",
  "win-unpacked",
  "Healthcare Admin Job Tracker.exe"
);

let failed = 0;

function pass(label) {
  console.log(`[PASS] ${label}`);
}

function fail(label, detail = "") {
  console.log(`[FAIL] ${label}${detail ? ` — ${detail}` : ""}`);
  failed += 1;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runEditFlow(page, testEmployer) {
  await page.setViewport({ width: 1360, height: 920 });
  await page.goto(base, { waitUntil: "networkidle2", timeout: 45000 });

  const body = await page.evaluate(() => document.body.innerText);
  if (!body.includes("Healthcare Admin Job Tracker")) {
    fail("Desktop window shows tracker");
    return false;
  }
  pass("Desktop window shows tracker");

  if (body.includes("Sign in to access")) {
    fail("Desktop edit flow", "cloud login required — set APP_URL to local server for full test");
    return false;
  }

  await page.waitForSelector('button[aria-label="Edit lead"]', { timeout: 15000 });
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
    fail("Desktop: open edit dialog");
    return false;
  }
  pass("Desktop: edit dialog opens");

  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  const openedStatus = await page.evaluate(() => {
    const statusLabel = [...document.querySelectorAll('[role="dialog"] label')].find(
      (l) => l.textContent?.trim() === "Status"
    );
    const trigger = statusLabel?.closest(".grid")?.querySelector('[role="combobox"]');
    if (!trigger) return false;
    trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    trigger.click();
    return true;
  });
  if (!openedStatus) {
    fail("Desktop: open status dropdown");
    return false;
  }

  await sleep(400);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  const pickedApplied = await page.evaluate(() => {
    const trigger = [...document.querySelectorAll('[role="dialog"] [role="combobox"]')].find(
      (el) => el.closest(".grid")?.querySelector("label")?.textContent?.trim() === "Status"
    );
    return trigger?.textContent?.includes("Applied") ?? false;
  });
  if (!pickedApplied) {
    fail("Desktop: select Applied");
    return false;
  }
  pass("Desktop: status set to Applied");

  const canvasBefore = await page.evaluate(() => document.querySelectorAll("canvas").length);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(
      (el) => el.textContent?.trim() === "Save Changes"
    );
    btn?.click();
  });

  await sleep(1500);
  const afterSave = await page.evaluate(() => document.body.innerText);

  if (afterSave.includes("region cannot be changed")) {
    fail("Desktop: no region error", "region cannot be changed after creation");
    return false;
  }
  pass("Desktop: no region error");

  if (afterSave.includes("Server Components render")) {
    fail("Desktop: no server render error");
    return false;
  }
  pass("Desktop: no server render error");

  try {
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), {
      timeout: 8000,
    });
    pass("Desktop: dialog closed after save");
  } catch {
    const dialogError = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog?.innerText ?? "";
    });
    if (dialogError.includes("region cannot be changed")) {
      fail("Desktop: save succeeded", dialogError);
    } else {
      fail("Desktop: dialog closed after save", dialogError.slice(0, 120));
    }
    return false;
  }

  try {
    await page.waitForFunction(
      (before) => document.querySelectorAll("canvas").length > before,
      { timeout: 8000 },
      canvasBefore
    );
    pass("Desktop: confetti appeared");
  } catch {
    fail("Desktop: confetti appeared");
  }

  return true;
}

console.log("=== Desktop App E2E Test ===\n");

if (!existsSync(electronExe)) {
  fail("Electron binary", electronExe);
  process.exit(1);
}
pass("Electron binary found");

if (!existsSync(packagedExe)) {
  fail("Packaged desktop .exe", "run build-windows-installer.bat first");
} else {
  pass("Packaged desktop .exe found");
}

// Ensure a test lead exists
const listRes = await fetch(`${base}/api/agent/leads`).catch(() => null);
if (!listRes?.ok) {
  fail("API reachable", `Is the server running at ${base}?`);
  console.log("\nStart with: npm run build && npm run start");
  process.exit(1);
}

const listData = await listRes.json();
const testLead = listData.leads?.find((l) => l.status === "need_to_apply");
if (!testLead) {
  fail("Find need_to_apply lead");
} else {
  pass(`Test lead: ${testLead.employer}`);
}

const puppeteer = await import("puppeteer");

async function testViaElectron(label, launch) {
  console.log(`\n-- ${label} --`);
  let electronProc = null;
  let browser = null;
  try {
    electronProc = launch();
    await sleep(5000);

    browser = await puppeteer.default.connect({
      browserURL: `http://127.0.0.1:${debugPort}`,
      defaultViewport: null,
    });
    pass(`${label}: remote debug connected`);

    const pages = await browser.pages();
    const page = pages[0] ?? (await browser.newPage());
    const ok = testLead ? await runEditFlow(page, testLead.employer) : false;

    if (ok && testLead) {
      await sleep(1000);
      const verify = await fetch(`${base}/api/agent/leads`);
      const data = await verify.json();
      const updated = data.leads?.find((l) => l.id === testLead.id);
      if (updated?.status === "applied") {
        pass(`${label}: status persisted`);
        await fetch(`${base}/api/agent/leads/${testLead.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "need_to_apply" }),
        });
      } else {
        fail(`${label}: status persisted`, updated?.status ?? "not found");
      }
    }
  } catch (err) {
    fail(`${label}`, err.message);
  } finally {
    await browser?.disconnect().catch(() => {});
    if (electronProc?.pid) {
      spawnSync("taskkill", ["/F", "/T", "/PID", String(electronProc.pid)], { shell: false });
    }
    await sleep(1000);
  }
}

const env = {
  ...process.env,
  APP_URL: base,
  ELECTRON_REMOTE_DEBUG: debugPort,
};

await testViaElectron("Electron dev shell", () =>
  spawn(electronExe, [mainJs], {
    cwd: join(root, "installers", "windows"),
    env,
    detached: true,
    stdio: "ignore",
  })
);

if (existsSync(packagedExe)) {
  await testViaElectron("Packaged .exe", () =>
    spawn(packagedExe, [], {
      cwd: join(root, "installers", "windows", "dist", "win-unpacked"),
      env,
      detached: true,
      stdio: "ignore",
    })
  );
}

console.log(`\n=== DESKTOP TEST: ${failed === 0 ? "ALL PASSED" : `${failed} FAILED`} ===`);
process.exit(failed === 0 ? 0 : 1);