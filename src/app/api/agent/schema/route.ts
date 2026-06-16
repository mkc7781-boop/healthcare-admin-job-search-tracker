import { NextRequest } from "next/server";
import { agentUnauthorizedResponse, verifyAgentRequest } from "@/lib/agent-auth";
import { MAX_LEADS_PER_REGION, PRIORITY_LABELS, REGIONS, STATUS_LABELS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  if (!verifyAgentRequest(request)) return agentUnauthorizedResponse();

  return Response.json({
    description:
      "Schema for your job-search agent to add leads to the Healthcare Admin Job Tracker.",
    max_leads_per_region: MAX_LEADS_PER_REGION,
    regions: REGIONS,
    priorities: PRIORITY_LABELS,
    statuses: STATUS_LABELS,
    required_fields: ["region", "employer"],
    optional_fields: [
      "career_site",
      "position",
      "city",
      "min_requirements",
      "priority",
      "status",
      "date_applied",
      "follow_up_date",
      "due_date",
      "contact_recruiter",
      "notes",
    ],
    defaults: {
      priority: "medium",
      status: "need_to_apply",
    },
    endpoints: {
      list_leads: "GET /api/agent/leads",
      list_by_region: "GET /api/agent/leads?region=sacramento",
      create_lead: "POST /api/agent/leads",
      create_leads_bulk: "POST /api/agent/leads/bulk",
      get_lead: "GET /api/agent/leads/{id}",
      update_lead: "PATCH /api/agent/leads/{id}",
      delete_lead: "DELETE /api/agent/leads/{id}",
      schema: "GET /api/agent/schema",
    },
    example_create_body: {
      region: "sacramento",
      employer: "UC Davis Health",
      career_site: "https://careers.ucdavis.edu/job/example",
      position: "Healthcare Administrator",
      city: "Sacramento",
      min_requirements: "Bachelor's degree, 3+ years healthcare admin experience",
      priority: "high",
      status: "need_to_apply",
      due_date: "2026-07-01",
      notes: "Found on LinkedIn. Strong benefits package.",
    },
  });
}