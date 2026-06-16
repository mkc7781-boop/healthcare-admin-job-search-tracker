import { NextRequest } from "next/server";
import { agentUnauthorizedResponse, verifyAgentRequest } from "@/lib/agent-auth";
import { deleteLeadRecord, getLeadById, updateLeadRecord } from "@/lib/leads";
import type { JobLeadInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!verifyAgentRequest(request)) return agentUnauthorizedResponse();

  const { id } = await context.params;
  const lead = await getLeadById(id, true);

  if (!lead) {
    return Response.json({ error: "Lead not found." }, { status: 404 });
  }

  return Response.json({ lead });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!verifyAgentRequest(request)) return agentUnauthorizedResponse();

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Partial<JobLeadInput>;
    const lead = await updateLeadRecord(id, body, true);
    return Response.json({ success: true, lead });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update lead";
    const status = message === "Lead not found." ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!verifyAgentRequest(request)) return agentUnauthorizedResponse();

  const { id } = await context.params;

  try {
    await deleteLeadRecord(id, true);
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete lead";
    return Response.json({ error: message }, { status: 404 });
  }
}