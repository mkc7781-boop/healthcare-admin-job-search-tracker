import { NextRequest } from "next/server";
import { agentUnauthorizedResponse, verifyAgentRequest } from "@/lib/agent-auth";
import { MAX_LEADS_PER_REGION, REGIONS } from "@/lib/constants";
import {
  createLeadRecord,
  getAllLeads,
  getRegionCapacity,
} from "@/lib/leads";
import type { JobLeadInput, Region } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (!verifyAgentRequest(request)) return agentUnauthorizedResponse();

  const region = request.nextUrl.searchParams.get("region") as Region | null;
  let leads = await getAllLeads(true);

  if (region) {
    leads = leads.filter((l) => l.region === region);
  }

  const capacity = await getRegionCapacity(true);

  return Response.json({
    leads,
    regions: REGIONS.map((r) => ({
      id: r.id,
      label: r.label,
      count: capacity[r.id] ?? 0,
      max: MAX_LEADS_PER_REGION,
      slots_available: MAX_LEADS_PER_REGION - (capacity[r.id] ?? 0),
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!verifyAgentRequest(request)) return agentUnauthorizedResponse();

  try {
    const body = (await request.json()) as JobLeadInput;
    const lead = await createLeadRecord(body, true);
    return Response.json({ success: true, lead }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create lead";
    return Response.json({ error: message }, { status: 400 });
  }
}