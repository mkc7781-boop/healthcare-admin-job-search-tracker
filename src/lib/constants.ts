import type { Priority, Region, Status } from "./types";

export const MAX_LEADS_PER_REGION = 10;

export const REGIONS: { id: Region; label: string }[] = [
  { id: "sacramento", label: "Sacramento" },
  { id: "bay_area", label: "Bay Area" },
  { id: "northern_california", label: "Northern California" },
  { id: "government", label: "Government Jobs" },
  { id: "state_of_california", label: "State of California" },
  { id: "remote", label: "Remote (Work from Home)" },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const STATUS_LABELS: Record<Status, string> = {
  need_to_apply: "Need to Apply",
  applied: "Applied",
  interviewing: "Interviewing",
  rejected: "Rejected",
};

export const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const EXPORT_COLUMNS = [
  "Region",
  "Employer",
  "Career Site",
  "Position",
  "City",
  "Min Requirements",
  "Priority",
  "Status",
  "Date Applied",
  "Follow-up",
  "Due Date",
  "Contact Recruiter",
  "Notes",
] as const;