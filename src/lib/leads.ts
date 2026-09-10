import { isCloudMode, getTrackerOwnerUserId } from "@/lib/config";
import * as json from "@/lib/storage/json-store";
import * as supabase from "@/lib/storage/supabase-store";
import type { JobLead, JobLeadInput, Region } from "@/lib/types";

export function getAgentUserId(): string | null {
  return getTrackerOwnerUserId();
}

export async function getAllLeads(forAgent = false): Promise<JobLead[]> {
  if (isCloudMode()) {
    return supabase.supabaseGetAllLeads(getAgentUserId() ?? undefined);
  }
  return json.jsonGetAllLeads();
}

export async function getLeadById(id: string, forAgent = false): Promise<JobLead | null> {
  if (isCloudMode()) {
    return supabase.supabaseGetLeadById(id, getAgentUserId() ?? undefined);
  }
  return json.jsonGetLeadById(id);
}

export async function createLeadRecord(
  input: JobLeadInput,
  forAgent = false
): Promise<JobLead> {
  if (isCloudMode()) {
    return supabase.supabaseCreateLead(input, getAgentUserId() ?? undefined);
  }
  return json.jsonCreateLead(input);
}

export async function updateLeadRecord(
  id: string,
  input: Partial<JobLeadInput>,
  forAgent = false
): Promise<JobLead> {
  if (isCloudMode()) {
    return supabase.supabaseUpdateLead(id, input, getAgentUserId() ?? undefined);
  }
  return json.jsonUpdateLead(id, input);
}

export async function deleteLeadRecord(id: string, forAgent = false): Promise<void> {
  if (isCloudMode()) {
    return supabase.supabaseDeleteLead(id, getAgentUserId() ?? undefined);
  }
  return json.jsonDeleteLead(id);
}

export async function getRegionCapacity(forAgent = false): Promise<Record<Region, number>> {
  if (isCloudMode()) {
    return supabase.supabaseGetRegionCapacity(getAgentUserId() ?? undefined);
  }
  return json.jsonGetRegionCapacity();
}