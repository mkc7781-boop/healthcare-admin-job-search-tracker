import { Dashboard } from "@/components/Dashboard";
import { TrackerLoadError } from "@/components/TrackerLoadError";
import { getAuthenticatedUserId } from "@/lib/auth";
import { isCloudMode } from "@/lib/config";
import { getAllLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

function isAuthMessage(message: string) {
  return (
    message.includes("Not signed in") ||
    message.includes("Authentication error") ||
    message.includes("JWT")
  );
}

export default async function HomePage() {
  const cloud = isCloudMode();

  if (!cloud && process.env.VERCEL) {
    return (
      <TrackerLoadError message="Cloud database not configured. Add Supabase environment variables in Vercel and redeploy." />
    );
  }

  if (cloud) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return <TrackerLoadError message="Not signed in. Please sign in again." />;
    }
  }

  try {
    const leads = await getAllLeads();
    return <Dashboard leads={leads} isCloud={cloud} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error loading leads.";
    return <TrackerLoadError message={isAuthMessage(message) ? "Not signed in. Please sign in again." : message} />;
  }
}