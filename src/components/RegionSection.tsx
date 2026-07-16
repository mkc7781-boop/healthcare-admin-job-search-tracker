"use client";

import { useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/LeadForm";
import { LeadsTable } from "@/components/LeadsTable";
import { PRIORITY_RANK } from "@/lib/constants";
import type { JobLead, Region } from "@/lib/types";

interface RegionSectionProps {
  regionId: Region;
  label: string;
  leads: JobLead[];
  searchQuery: string;
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

export function RegionSection({ regionId, label, leads, searchQuery }: RegionSectionProps) {
  const [open, setOpen] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    const matched = leads.filter((lead) => matchesSearch(lead, searchQuery));
    return [...matched].sort((a, b) => {
      const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return sortAsc ? diff : -diff;
    });
  }, [leads, searchQuery, sortAsc]);

  const hasSearch = searchQuery.trim().length > 0;

  if (hasSearch && filteredLeads.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 text-left font-semibold"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {label}
          <Badge variant="outline">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </Badge>
          {hasSearch && (
            <span className="text-sm font-normal text-[var(--color-muted-foreground)]">
              ({filteredLeads.length} shown)
            </span>
          )}
        </button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setSortAsc((prev) => !prev)}>
            {sortAsc ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
            Sort by Priority
          </Button>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {open && (
        <div className="p-4">
          <LeadsTable leads={filteredLeads} />
        </div>
      )}

      <LeadForm open={formOpen} onOpenChange={setFormOpen} region={regionId} />
    </section>
  );
}