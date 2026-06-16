"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/LeadForm";
import { NotesCell } from "@/components/NotesCell";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteLead } from "@/lib/actions";
import type { JobLead } from "@/lib/types";

function formatDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

const COLUMNS: { header: string; minWidth: string }[] = [
  { header: "Employer", minWidth: "min-w-[180px]" },
  { header: "Career Site", minWidth: "min-w-[100px]" },
  { header: "Position", minWidth: "min-w-[160px]" },
  { header: "City", minWidth: "min-w-[120px]" },
  { header: "Min Requirements", minWidth: "min-w-[220px]" },
  { header: "Priority", minWidth: "min-w-[100px]" },
  { header: "Status", minWidth: "min-w-[130px]" },
  { header: "Date Applied", minWidth: "min-w-[110px]" },
  { header: "Follow-up", minWidth: "min-w-[100px]" },
  { header: "Due Date", minWidth: "min-w-[100px]" },
  { header: "Contact", minWidth: "min-w-[160px]" },
  { header: "Notes", minWidth: "min-w-[140px]" },
  { header: "Actions", minWidth: "min-w-[90px]" },
];

interface LeadsTableProps {
  leads: JobLead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [editingLead, setEditingLead] = useState<JobLead | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteLead(id);
    });
  }

  if (leads.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
        No leads in this section yet.
      </p>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-md border border-[var(--color-border)]">
        <table className="w-max min-w-full table-auto text-left text-sm">
          <thead className="bg-[var(--color-muted)]">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.header}
                  className={`px-4 py-3 font-medium whitespace-nowrap ${col.minWidth}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-[var(--color-border)] align-top">
                <td className={`px-4 py-3 font-medium ${COLUMNS[0].minWidth}`}>
                  {lead.employer}
                </td>
                <td className={`px-4 py-3 ${COLUMNS[1].minWidth}`}>
                  {lead.career_site ? (
                    <a
                      href={lead.career_site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] underline-offset-2 hover:underline whitespace-nowrap"
                    >
                      Open link
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={`px-4 py-3 ${COLUMNS[2].minWidth}`}>{lead.position || "—"}</td>
                <td className={`px-4 py-3 ${COLUMNS[3].minWidth}`}>{lead.city || "—"}</td>
                <td className={`px-4 py-3 whitespace-pre-wrap ${COLUMNS[4].minWidth}`}>
                  {lead.min_requirements || "—"}
                </td>
                <td className={`px-4 py-3 ${COLUMNS[5].minWidth}`}>
                  <PriorityBadge priority={lead.priority} />
                </td>
                <td className={`px-4 py-3 ${COLUMNS[6].minWidth}`}>
                  <StatusBadge status={lead.status} />
                </td>
                <td className={`px-4 py-3 whitespace-nowrap ${COLUMNS[7].minWidth}`}>
                  {formatDate(lead.date_applied)}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap ${COLUMNS[8].minWidth}`}>
                  {formatDate(lead.follow_up_date)}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap ${COLUMNS[9].minWidth}`}>
                  {formatDate(lead.due_date)}
                </td>
                <td className={`px-4 py-3 whitespace-pre-wrap ${COLUMNS[10].minWidth}`}>
                  {lead.contact_recruiter || "—"}
                </td>
                <td className={`px-4 py-3 ${COLUMNS[11].minWidth}`}>
                  <NotesCell lead={lead} />
                </td>
                <td className={`px-4 py-3 ${COLUMNS[12].minWidth}`}>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingLead(lead)}
                      aria-label="Edit lead"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Delete lead">
                          <Trash2 className="h-4 w-4 text-[var(--color-destructive)]" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove {lead.employer} —{" "}
                            {lead.position || "position unknown"} from your tracker.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(lead.id)}
                            disabled={isPending}
                            className="bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:opacity-90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingLead && (
        <LeadForm
          open={Boolean(editingLead)}
          onOpenChange={(open) => !open && setEditingLead(null)}
          lead={editingLead}
        />
      )}
    </>
  );
}