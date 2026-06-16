import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { TrackerLoadError } from "@/components/TrackerLoadError";
import { getAuthenticatedUserId } from "@/lib/auth";
import { isCloudMode } from "@/lib/config";
import { getAllLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cloud = isCloudMode();

  if (!cloud && process.env.VERCEL) {
    return (
      <TrackerLoadError message="Cloud database not configured. Add Supabase environment variables in Vercel and redeploy." />
    );
  }

  if (cloud) {
    const userId = await getAuthenticatedUserId();
    if (!userId) redirect("/login");
  }

  try {
    const leads = await getAllLeads();
    return <Dashboard leads={leads} isCloud={cloud} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error loading leads.";

    if (
      message.includes("Not signed in") ||
      message.includes("Authentication error") ||
      message.includes("JWT")
    ) {
      redirect("/login");
    }

    return <TrackerLoadError message={message} />;
  }
}