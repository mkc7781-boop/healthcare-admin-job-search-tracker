"use server";

import { actionError, type ActionResult } from "@/lib/action-result";
import { isCloudMode } from "@/lib/config";
import {
  createLeadRecord,
  deleteLeadRecord,
  getAllLeads,
  updateLeadRecord,
} from "@/lib/leads";
import { createClient } from "@/lib/supabase/server";
import type { JobLead, JobLeadInput } from "@/lib/types";

export async function getLeads(): Promise<JobLead[]> {
  return getAllLeads();
}

export async function createLead(input: JobLeadInput): Promise<ActionResult> {
  try {
    await createLeadRecord(input);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateLead(
  id: string,
  input: Partial<JobLeadInput>
): Promise<ActionResult> {
  try {
    await updateLeadRecord(id, input);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    await deleteLeadRecord(id);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function signOut(): Promise<ActionResult> {
  try {
    if (isCloudMode()) {
      const supabase = await createClient();
      await supabase.auth.signOut();
    }
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function isUsingCloud(): Promise<boolean> {
  return isCloudMode();
}