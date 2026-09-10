"use client";

import { useEffect, useMemo, useState } from "react";
import { ExportButtons } from "@/components/ExportButtons";
import { RegionSection } from "@/components/RegionSection";
import { SearchBar } from "@/components/SearchBar";
import { REGIONS } from "@/lib/constants";
import type { JobLead } from "@/lib/types";

interface DashboardProps {
  leads: JobLead[];
  buildId?: string;
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

export function Dashboard({ leads, buildId = "dev" }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [brightness, setBrightness] = useState(100);

  useEffect(() => {
    const n = Number(localStorage.getItem("brightness") || 100);
    if (Number.isFinite(n)) setBrightness(n);
  }, []);

  function onBrightness(n: number) {
    setBrightness(n);
    localStorage.setItem("brightness", String(n));
    document.documentElement.style.filter = `brightness(${n}%)`;
  }

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
            Add as many jobs as you want. Use Remove on the left of each row to delete one.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            Brightness
            <input
              type="range"
              min={50}
              max={150}
              value={brightness}
              onChange={(e) => onBrightness(Number(e.target.value))}
              className="h-2 w-36 cursor-pointer accent-[var(--color-primary)]"
              aria-label="Brightness"
            />
          </label>

        </div>
      </header>

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

      <p className="pb-2 text-center text-xs text-[var(--color-muted-foreground)]">
        Build {buildId}
      </p>
    </div>
  );
}