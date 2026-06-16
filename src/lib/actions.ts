"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUserId } from "@/lib/auth";
import { isCloudMode } from "@/lib/config";
import {
  createLeadRecord,
  deleteLeadRecord,
  getAllLeads,
  updateLeadRecord,
} from "@/lib/leads";
import { createClient } from "@/lib/supabase/server";
import type { JobLead, JobLeadInput } from "@/lib/types";

async function ensureCloudAuth() {
  if (isCloudMode()) {
    await requireAuthenticatedUserId();
  }
}

export async function getLeads(): Promise<JobLead[]> {
  await ensureCloudAuth();
  return getAllLeads();
}

export async function createLead(input: JobLeadInput) {
  await ensureCloudAuth();
  await createLeadRecord(input);
  revalidatePath("/");
}

export async function updateLead(id: string, input: Partial<JobLeadInput>) {
  await ensureCloudAuth();
  await updateLeadRecord(id, input);
  revalidatePath("/");
}

export async function deleteLead(id: string) {
  await ensureCloudAuth();
  await deleteLeadRecord(id);
  revalidatePath("/");
}

export async function signOut() {
  if (isCloudMode()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/");
}

export async function isUsingCloud(): Promise<boolean> {
  return isCloudMode();
}