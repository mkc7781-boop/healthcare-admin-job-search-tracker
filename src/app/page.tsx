import { Dashboard } from "@/components/Dashboard";
import { getLeads, isUsingCloud } from "@/lib/actions";

export default async function HomePage() {
  const [leads, cloud] = await Promise.all([getLeads(), isUsingCloud()]);
  return <Dashboard leads={leads} isCloud={cloud} />;
}