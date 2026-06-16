export type Region =
  | "sacramento"
  | "bay_area"
  | "northern_california"
  | "government"
  | "state_of_california"
  | "remote";

export type Priority = "high" | "medium" | "low";

export type Status = "need_to_apply" | "applied" | "interviewing" | "rejected";

export interface JobLead {
  id: string;
  region: Region;
  employer: string;
  career_site: string | null;
  position: string | null;
  city: string | null;
  min_requirements: string | null;
  priority: Priority;
  status: Status;
  date_applied: string | null;
  follow_up_date: string | null;
  due_date: string | null;
  contact_recruiter: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type JobLeadInput = Omit<JobLead, "id" | "created_at" | "updated_at">;