import { Dashboard } from "@/components/Dashboard";
import { TrackerLoadError } from "@/components/TrackerLoadError";
import { getAllLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const leads = await getAllLeads();
    const buildId =
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
      process.env.NEXT_PUBLIC_BUILD_ID ??
      "dev";
    return <Dashboard leads={leads} buildId={buildId} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error loading leads.";
    return <TrackerLoadError message={message} />;
  }
}