"use client";

import { useRouter } from "next/navigation";
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
import { MinRequirementsCell } from "@/components/MinRequirementsCell";
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

const ACTION_COL = { header: "Actions", width: "w-[148px]" };

const COLUMNS: { header: string; width: string }[] = [
  { header: "Employer", width: "w-[128px]" },
  { header: "Career Site", width: "w-[76px]" },
  { header: "Position", width: "w-[128px]" },
  { header: "City", width: "w-[96px]" },
  { header: "Min Requirements", width: "w-[168px]" },
  { header: "Priority", width: "w-[80px]" },
  { header: "Status", width: "w-[108px]" },
  { header: "Date Applied", width: "w-[92px]" },
  { header: "Follow-up", width: "w-[92px]" },
  { header: "Due Date", width: "w-[92px]" },
  { header: "Contact", width: "w-[120px]" },
  { header: "Notes", width: "w-[168px]" },
];

const stickyActionClass =
  "sticky left-0 z-10 border-r border-[var(--color-border)] shadow-[2px_0_8px_rgba(15,23,42,0.08)]";

interface LeadsTableProps {
  leads: JobLead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [editingLead, setEditingLead] = useState<JobLead | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(id: string) {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteLead(id);
      if (result.ok) {
        router.refresh();
        return;
      }
      setDeleteError(result.error);
    });
  }

  if (leads.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
        No jobs in this section yet. Use Add job to add as many as you need.
      </p>
    );
  }

  return (
    <>
      {deleteError && (
        <p className="mb-3 text-sm text-[var(--color-destructive)]">{deleteError}</p>
      )}
      <div className="w-full overflow-x-auto rounded-md border border-[var(--color-border)]">
        <table className="w-full min-w-[1496px] table-fixed text-left text-sm">
          <thead className="bg-[var(--color-muted)]">
            <tr>
              <th
                className={`px-3 py-3 font-medium whitespace-nowrap ${ACTION_COL.width} ${stickyActionClass} bg-[var(--color-muted)]`}
              >
                {ACTION_COL.header}
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.header}
                  className={`px-3 py-3 font-medium whitespace-nowrap ${col.width}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-[var(--color-border)] align-top">
                <td
                  className={`px-3 py-3 ${ACTION_COL.width} ${stickyActionClass} bg-[var(--color-card)]`}
                >
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingLead(lead)}
                      aria-label={`Edit ${lead.employer}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Remove ${lead.employer}`}
                          className="text-[var(--color-destructive)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove this job?</AlertDialogTitle>
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
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
                <td className={`truncate px-3 py-3 font-medium ${COLUMNS[0].width}`} title={lead.employer}>
                  {lead.employer}
                </td>
                <td className={`px-3 py-3 ${COLUMNS[1].width}`}>
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
                <td className={`truncate px-3 py-3 ${COLUMNS[2].width}`} title={lead.position || undefined}>
                  {lead.position || "—"}
                </td>
                <td className={`truncate px-3 py-3 ${COLUMNS[3].width}`} title={lead.city || undefined}>
                  {lead.city || "—"}
                </td>
                <td className={`px-3 py-3 ${COLUMNS[4].width}`}>
                  <MinRequirementsCell lead={lead} />
                </td>
                <td className={`px-3 py-3 ${COLUMNS[5].width}`}>
                  <PriorityBadge priority={lead.priority} />
                </td>
                <td className={`px-3 py-3 ${COLUMNS[6].width}`}>
                  <StatusBadge status={lead.status} />
                </td>
                <td className={`px-3 py-3 whitespace-nowrap ${COLUMNS[7].width}`}>
                  {formatDate(lead.date_applied)}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap ${COLUMNS[8].width}`}>
                  {formatDate(lead.follow_up_date)}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap ${COLUMNS[9].width}`}>
                  {formatDate(lead.due_date)}
                </td>
                <td
                  className={`truncate px-3 py-3 ${COLUMNS[10].width}`}
                  title={lead.contact_recruiter || undefined}
                >
                  {lead.contact_recruiter || "—"}
                </td>
                <td className={`px-3 py-3 ${COLUMNS[11].width}`}>
                  <NotesCell lead={lead} />
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
