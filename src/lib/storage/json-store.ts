import { promises as fs } from "fs";
import path from "path";
import { MAX_LEADS_PER_REGION } from "@/lib/constants";
import type { JobLead, JobLeadInput, Region } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "leads.json");

function now() {
  return new Date().toISOString();
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readLeads(): Promise<JobLead[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as JobLead[];
}

async function writeLeads(leads: JobLead[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

function countByRegion(leads: JobLead[], region: Region): number {
  return leads.filter((l) => l.region === region).length;
}

export async function jsonGetAllLeads(): Promise<JobLead[]> {
  const leads = await readLeads();
  return leads.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function jsonGetLeadById(id: string): Promise<JobLead | null> {
  const leads = await readLeads();
  return leads.find((l) => l.id === id) ?? null;
}

export async function jsonCreateLead(input: JobLeadInput): Promise<JobLead> {
  const leads = await readLeads();

  if (!input.employer?.trim()) {
    throw new Error("Employer is required.");
  }

  if (countByRegion(leads, input.region) >= MAX_LEADS_PER_REGION) {
    throw new Error(
      `Maximum of ${MAX_LEADS_PER_REGION} leads per region reached for ${input.region}.`
    );
  }

  const timestamp = now();
  const lead: JobLead = {
    id: crypto.randomUUID(),
    region: input.region,
    employer: input.employer.trim(),
    career_site: input.career_site?.trim() || null,
    position: input.position?.trim() || null,
    city: input.city?.trim() || null,
    min_requirements: input.min_requirements?.trim() || null,
    priority: input.priority,
    status: input.status,
    date_applied: input.date_applied || null,
    follow_up_date: input.follow_up_date || null,
    due_date: input.due_date || null,
    contact_recruiter: input.contact_recruiter?.trim() || null,
    notes: input.notes?.trim() || null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  leads.push(lead);
  await writeLeads(leads);
  return lead;
}

export async function jsonUpdateLead(
  id: string,
  input: Partial<JobLeadInput>
): Promise<JobLead> {
  const leads = await readLeads();
  const index = leads.findIndex((l) => l.id === id);

  if (index === -1) throw new Error("Lead not found.");

  const current = leads[index];

  if (input.region && input.region !== current.region) {
    throw new Error("Region cannot be changed after creation.");
  }

  if (input.employer !== undefined && !input.employer.trim()) {
    throw new Error("Employer is required.");
  }

  const updated: JobLead = {
    ...current,
    ...input,
    employer: input.employer !== undefined ? input.employer.trim() : current.employer,
    career_site:
      input.career_site !== undefined
        ? input.career_site?.trim() || null
        : current.career_site,
    position:
      input.position !== undefined ? input.position?.trim() || null : current.position,
    city: input.city !== undefined ? input.city?.trim() || null : current.city,
    min_requirements:
      input.min_requirements !== undefined
        ? input.min_requirements?.trim() || null
        : current.min_requirements,
    contact_recruiter:
      input.contact_recruiter !== undefined
        ? input.contact_recruiter?.trim() || null
        : current.contact_recruiter,
    notes: input.notes !== undefined ? input.notes?.trim() || null : current.notes,
    updated_at: now(),
  };

  leads[index] = updated;
  await writeLeads(leads);
  return updated;
}

export async function jsonDeleteLead(id: string): Promise<void> {
  const leads = await readLeads();
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === leads.length) throw new Error("Lead not found.");
  await writeLeads(filtered);
}

export async function jsonGetRegionCapacity(): Promise<Record<Region, number>> {
  const leads = await readLeads();
  return leads.reduce(
    (acc, lead) => {
      acc[lead.region] = (acc[lead.region] ?? 0) + 1;
      return acc;
    },
    {} as Record<Region, number>
  );
}