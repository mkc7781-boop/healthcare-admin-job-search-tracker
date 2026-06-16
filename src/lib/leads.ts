import { isCloudMode, getTrackerOwnerUserId } from "@/lib/config";
import * as json from "@/lib/storage/json-store";
import * as supabase from "@/lib/storage/supabase-store";
import type { JobLead, JobLeadInput, Region } from "@/lib/types";

/** User ID for agent API in cloud mode (service role inserts). */
export function getAgentUserId(): string {
  const id = getTrackerOwnerUserId();
  if (!id) {
    throw new Error(
      "TRACKER_OWNER_USER_ID is not set. See DEPLOY.md after creating your account."
    );
  }
  return id;
}

export async function getAllLeads(forAgent = false): Promise<JobLead[]> {
  if (isCloudMode()) {
    return supabase.supabaseGetAllLeads(forAgent ? getAgentUserId() : undefined);
  }
  return json.jsonGetAllLeads();
}

export async function getLeadById(id: string, forAgent = false): Promise<JobLead | null> {
  if (isCloudMode()) {
    return supabase.supabaseGetLeadById(id, forAgent ? getAgentUserId() : undefined);
  }
  return json.jsonGetLeadById(id);
}

export async function createLeadRecord(
  input: JobLeadInput,
  forAgent = false
): Promise<JobLead> {
  if (isCloudMode()) {
    return supabase.supabaseCreateLead(input, forAgent ? getAgentUserId() : undefined);
  }
  return json.jsonCreateLead(input);
}

export async function updateLeadRecord(
  id: string,
  input: Partial<JobLeadInput>,
  forAgent = false
): Promise<JobLead> {
  if (isCloudMode()) {
    return supabase.supabaseUpdateLead(id, input, forAgent ? getAgentUserId() : undefined);
  }
  return json.jsonUpdateLead(id, input);
}

export async function deleteLeadRecord(id: string, forAgent = false): Promise<void> {
  if (isCloudMode()) {
    return supabase.supabaseDeleteLead(id, forAgent ? getAgentUserId() : undefined);
  }
  return json.jsonDeleteLead(id);
}

export async function getRegionCapacity(forAgent = false): Promise<Record<Region, number>> {
  if (isCloudMode()) {
    return supabase.supabaseGetRegionCapacity(forAgent ? getAgentUserId() : undefined);
  }
  return json.jsonGetRegionCapacity();
}