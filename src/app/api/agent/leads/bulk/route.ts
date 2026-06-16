import { NextRequest } from "next/server";
import { agentUnauthorizedResponse, verifyAgentRequest } from "@/lib/agent-auth";
import { createLeadRecord } from "@/lib/leads";
import type { JobLeadInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  if (!verifyAgentRequest(request)) return agentUnauthorizedResponse();

  try {
    const body = (await request.json()) as { leads?: JobLeadInput[] };
    const inputs = body.leads;

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return Response.json(
        { error: "Body must include a non-empty leads array." },
        { status: 400 }
      );
    }

    const created = [];
    const errors: { index: number; error: string }[] = [];

    for (let i = 0; i < inputs.length; i++) {
      try {
        const lead = await createLeadRecord(inputs[i], true);
        created.push(lead);
      } catch (err) {
        errors.push({
          index: i,
          error: err instanceof Error ? err.message : "Failed to create lead",
        });
      }
    }

    return Response.json({
      success: errors.length === 0,
      created_count: created.length,
      error_count: errors.length,
      created,
      errors,
    });
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}