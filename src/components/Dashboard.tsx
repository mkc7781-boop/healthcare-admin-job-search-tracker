"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { LogOut, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportButtons } from "@/components/ExportButtons";
import { RegionSection } from "@/components/RegionSection";
import { SearchBar } from "@/components/SearchBar";
import { signOut } from "@/lib/actions";
import { REGIONS } from "@/lib/constants";
import type { JobLead } from "@/lib/types";

interface DashboardProps {
  leads: JobLead[];
  isCloud?: boolean;
}

function matchesSearch(lead: JobLead, query: string) {
  if (!query.trim()) return true;
  const haystack = [
    lead.employer,
    lead.position,
    lead.city,
    lead.notes,
    lead.contact_recruiter,
    lead.min_requirements,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function Dashboard({ leads, isCloud = false }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const exportLeads = useMemo(
    () => leads.filter((lead) => matchesSearch(lead, searchQuery)),
    [leads, searchQuery]
  );

  const leadsByRegion = useMemo(() => {
    const grouped = Object.fromEntries(REGIONS.map((r) => [r.id, [] as JobLead[]]));
    for (const lead of leads) {
      grouped[lead.region]?.push(lead);
    }
    return grouped;
  }, [leads]);

  return (
    <div className="flex w-full flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Healthcare Admin Job Tracker</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Track up to 10 leads per region. Search, sort, and export your applications.
          </p>
        </div>
        {isCloud && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await signOut();
                router.push("/login");
                router.refresh();
              })
            }
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
      </header>

      {isCloud ? (
        <div className="flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Cloud sync enabled.</strong> Open this same URL on your phone or any device —
            sign in with the same account and your leads sync automatically.
          </span>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Local mode.</strong> Data is stored on this computer only. See{" "}
          <code className="rounded bg-white/60 px-1">DEPLOY.md</code> to enable cross-device sync.
        </div>
      )}

      <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
        <strong>Job-search agent:</strong> POST leads to{" "}
        <code className="rounded bg-white/60 px-1">/api/agent/leads</code>. See{" "}
        <code className="rounded bg-white/60 px-1">JOB_AGENT_API.md</code> for the full API.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <ExportButtons leads={exportLeads} />
      </div>

      <div className="flex flex-col gap-4">
        {REGIONS.map((region) => (
          <RegionSection
            key={region.id}
            regionId={region.id}
            label={region.label}
            leads={leadsByRegion[region.id] ?? []}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}