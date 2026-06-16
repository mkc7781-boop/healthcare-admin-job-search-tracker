import { Dashboard } from "@/components/Dashboard";
import { requireAuthenticatedUserId } from "@/lib/auth";
import { isCloudMode } from "@/lib/config";
import { getAllLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cloud = isCloudMode();

  if (cloud) {
    await requireAuthenticatedUserId();
  }

  const leads = await getAllLeads();
  return <Dashboard leads={leads} isCloud={cloud} />;
}