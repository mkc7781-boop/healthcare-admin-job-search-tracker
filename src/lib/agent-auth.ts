import { NextRequest } from "next/server";
import { isCloudMode } from "@/lib/config";

export function verifyAgentRequest(request: NextRequest): boolean {
  const apiKey = process.env.AGENT_API_KEY;
  const header = request.headers.get("x-agent-api-key");

  // Cloud mode: API key is required
  if (isCloudMode()) {
    return Boolean(apiKey && header === apiKey);
  }

  // Local mode: open if no key configured
  if (!apiKey) return true;
  return header === apiKey;
}

export function agentUnauthorizedResponse() {
  return Response.json(
    {
      error: isCloudMode()
        ? "Unauthorized. Set AGENT_API_KEY in production and send x-agent-api-key header."
        : "Unauthorized. Provide a valid x-agent-api-key header.",
    },
    { status: 401 }
  );
}