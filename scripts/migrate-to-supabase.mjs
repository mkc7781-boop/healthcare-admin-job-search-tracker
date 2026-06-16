/**
 * Upload local data/leads.json to Supabase cloud.
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   TRACKER_OWNER_USER_ID
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — copy .env.local.example and fill in values.");
    process.exit(1);
  }
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.TRACKER_OWNER_USER_ID;

if (!url || !serviceKey || !userId) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TRACKER_OWNER_USER_ID in .env.local");
  process.exit(1);
}

const dataPath = join(root, "data", "leads.json");
if (!existsSync(dataPath)) {
  console.log("No data/leads.json found — nothing to migrate.");
  process.exit(0);
}

const leads = JSON.parse(readFileSync(dataPath, "utf-8"));
if (!leads.length) {
  console.log("leads.json is empty — nothing to migrate.");
  process.exit(0);
}

const supabase = createClient(url, serviceKey);

console.log(`Migrating ${leads.length} leads to Supabase for user ${userId}...`);

let ok = 0;
let fail = 0;

for (const lead of leads) {
  const { error } = await supabase.from("job_leads").insert({
    id: lead.id,
    user_id: userId,
    region: lead.region,
    employer: lead.employer,
    career_site: lead.career_site,
    position: lead.position,
    city: lead.city,
    min_requirements: lead.min_requirements,
    priority: lead.priority,
    status: lead.status,
    date_applied: lead.date_applied,
    follow_up_date: lead.follow_up_date,
    due_date: lead.due_date,
    contact_recruiter: lead.contact_recruiter,
    notes: lead.notes,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
  });

  if (error) {
    console.error(`  FAIL ${lead.employer}: ${error.message}`);
    fail++;
  } else {
    console.log(`  OK   ${lead.employer}`);
    ok++;
  }
}

console.log(`\nDone: ${ok} migrated, ${fail} failed.`);
process.exit(fail > 0 ? 1 : 0);