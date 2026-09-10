import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.APP_URL ?? "http://localhost:3000";
const MARKER = `TEST_UNLIMITED_${Date.now()}`;
const REGION = "government";
const TARGET_COUNT = 11;

function fail(message) {
  console.error("FAIL:", message);
  process.exitCode = 1;
}

function pass(message) {
  console.log("PASS:", message);
}

const regionSource = readFileSync(join(root, "src/components/RegionSection.tsx"), "utf8");
if (regionSource.includes("MAX_LEADS") || regionSource.includes("atLimit")) {
  fail("RegionSection still has a per-region cap");
} else {
  pass("RegionSection has no per-region cap");
}

const jsonStore = readFileSync(join(root, "src/lib/storage/json-store.ts"), "utf8");
const supabaseStore = readFileSync(join(root, "src/lib/storage/supabase-store.ts"), "utf8");
if (jsonStore.includes("MAX_LEADS") || supabaseStore.includes("MAX_LEADS")) {
  fail("Storage layer still has a per-region cap");
} else {
  pass("Storage layer has no per-region cap");
}

const tableSource = readFileSync(join(root, "src/components/LeadsTable.tsx"), "utf8");
if (!tableSource.includes("Remove") || !tableSource.includes("handleDelete")) {
  fail("LeadsTable is missing Remove/delete");
} else {
  pass("LeadsTable exposes Remove");
}

const createdIds = [];

async function cleanup() {
  for (const id of createdIds) {
    await fetch(`${base}/api/agent/leads/${id}`, { method: "DELETE" }).catch(() => {});
  }
}

try {
  for (let i = 1; i <= TARGET_COUNT; i++) {
    const res = await fetch(`${base}/api/agent/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        region: REGION,
        employer: `${MARKER} ${i}`,
        position: `Capacity test role ${i}`,
        priority: "low",
        status: "need_to_apply",
        notes: MARKER,
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.lead?.id) {
      fail(`Create job ${i} of ${TARGET_COUNT}: ${res.status} ${JSON.stringify(data)}`);
      await cleanup();
      process.exit(1);
    }
    createdIds.push(data.lead.id);
  }
  pass(`Created ${TARGET_COUNT} jobs in ${REGION}`);

  const listRes = await fetch(`${base}/api/agent/leads?region=${REGION}`);
  const listData = await listRes.json();
  const marked = (listData.leads ?? []).filter((lead) => lead.notes === MARKER);
  if (marked.length !== TARGET_COUNT) {
    fail(`Expected ${TARGET_COUNT} marked jobs, found ${marked.length}`);
    await cleanup();
    process.exit(1);
  }
  pass(`Listed ${TARGET_COUNT} jobs past the old 10-job cap`);

  const toDelete = createdIds[0];
  const delRes = await fetch(`${base}/api/agent/leads/${toDelete}`, { method: "DELETE" });
  if (!delRes.ok) {
    const body = await delRes.text();
    fail(`Delete job: ${delRes.status} ${body}`);
    await cleanup();
    process.exit(1);
  }
  createdIds.shift();
  pass("Deleted one job");

  const afterRes = await fetch(`${base}/api/agent/leads?region=${REGION}`);
  const afterData = await afterRes.json();
  const remaining = (afterData.leads ?? []).filter((lead) => lead.notes === MARKER);
  if (remaining.some((lead) => lead.id === toDelete) || remaining.length !== TARGET_COUNT - 1) {
    fail(`Delete did not remove the job (remaining ${remaining.length})`);
    await cleanup();
    process.exit(1);
  }
  pass("Deleted job is gone from the tracker");
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
  console.error("Is the server running? Use npm run dev, not start.bat.");
} finally {
  await cleanup();
}

if (process.exitCode) {
  process.exit(1);
}
console.log("ALL PASSED");
