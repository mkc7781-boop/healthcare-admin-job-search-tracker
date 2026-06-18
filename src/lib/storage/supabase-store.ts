import { MAX_LEADS_PER_REGION } from "@/lib/constants";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { JobLead, JobLeadInput, Region } from "@/lib/types";

type DbLead = JobLead & { user_id: string };

function mapRow(row: DbLead): JobLead {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_id, ...lead } = row;
  return lead;
}

async function getUserClient(userId?: string) {
  if (userId) {
    return { client: createServiceClient(), userId };
  }
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error) throw new Error(`Authentication error: ${error.message}`);
  if (!user) throw new Error("Not signed in. Please sign in again.");
  return { client, userId: user.id };
}

function formatDbError(message: string): string {
  if (message.includes("job_leads") && message.includes("does not exist")) {
    return "Database table missing. Run the SQL migration in Supabase (see DEPLOY.md).";
  }
  if (message.includes("permission denied for table job_leads")) {
    return "Database permissions missing. Run 002_job_leads_grants.sql in Supabase SQL Editor (see DEPLOY.md).";
  }
  return message;
}

export async function supabaseGetAllLeads(userId?: string): Promise<JobLead[]> {
  const { client, userId: uid } = await getUserClient(userId);
  const { data, error } = await client
    .from("job_leads")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  if (error) throw new Error(formatDbError(error.message));
  return (data ?? []).map((row) => mapRow(row as DbLead));
}

export async function supabaseGetLeadById(
  id: string,
  userId?: string
): Promise<JobLead | null> {
  const { client, userId: uid } = await getUserClient(userId);
  const { data, error } = await client
    .from("job_leads")
    .select("*")
    .eq("id", id)
    .eq("user_id", uid)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as DbLead) : null;
}

export async function supabaseCreateLead(
  input: JobLeadInput,
  userId?: string
): Promise<JobLead> {
  if (!input.employer?.trim()) throw new Error("Employer is required.");

  const { client, userId: uid } = await getUserClient(userId);

  const { count, error: countError } = await client
    .from("job_leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", uid)
    .eq("region", input.region);

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) >= MAX_LEADS_PER_REGION) {
    throw new Error(
      `Maximum of ${MAX_LEADS_PER_REGION} leads per region reached for ${input.region}.`
    );
  }

  const { data, error } = await client
    .from("job_leads")
    .insert({
      user_id: uid,
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
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as DbLead);
}

export async function supabaseUpdateLead(
  id: string,
  input: Partial<JobLeadInput>,
  userId?: string
): Promise<JobLead> {
  if (input.employer !== undefined && !input.employer.trim()) {
    throw new Error("Employer is required.");
  }

  const { client, userId: uid } = await getUserClient(userId);

  if (input.region !== undefined) {
    const existing = await supabaseGetLeadById(id, userId);
    if (!existing) throw new Error("Lead not found.");
    if (input.region !== existing.region) {
      throw new Error("Region cannot be changed after creation.");
    }
  }

  const payload: Record<string, unknown> = {};
  if (input.employer !== undefined) payload.employer = input.employer.trim();
  if (input.career_site !== undefined) payload.career_site = input.career_site?.trim() || null;
  if (input.position !== undefined) payload.position = input.position?.trim() || null;
  if (input.city !== undefined) payload.city = input.city?.trim() || null;
  if (input.min_requirements !== undefined)
    payload.min_requirements = input.min_requirements?.trim() || null;
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.status !== undefined) payload.status = input.status;
  if (input.date_applied !== undefined) payload.date_applied = input.date_applied || null;
  if (input.follow_up_date !== undefined) payload.follow_up_date = input.follow_up_date || null;
  if (input.due_date !== undefined) payload.due_date = input.due_date || null;
  if (input.contact_recruiter !== undefined)
    payload.contact_recruiter = input.contact_recruiter?.trim() || null;
  if (input.notes !== undefined) payload.notes = input.notes?.trim() || null;

  const { data, error } = await client
    .from("job_leads")
    .update(payload)
    .eq("id", id)
    .eq("user_id", uid)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as DbLead);
}

export async function supabaseDeleteLead(id: string, userId?: string): Promise<void> {
  const { client, userId: uid } = await getUserClient(userId);
  const { error } = await client.from("job_leads").delete().eq("id", id).eq("user_id", uid);
  if (error) throw new Error(error.message);
}

export async function supabaseGetRegionCapacity(
  userId?: string
): Promise<Record<Region, number>> {
  const leads = await supabaseGetAllLeads(userId);
  return leads.reduce(
    (acc, lead) => {
      acc[lead.region] = (acc[lead.region] ?? 0) + 1;
      return acc;
    },
    {} as Record<Region, number>
  );
}