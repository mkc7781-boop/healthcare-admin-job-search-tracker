"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { updateLead } from "@/lib/actions";
import type { JobLead } from "@/lib/types";

interface MinRequirementsCellProps {
  lead: JobLead;
}

function previewText(value: string | null) {
  if (!value?.trim()) return null;
  const text = value.trim();
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export function MinRequirementsCell({ lead }: MinRequirementsCellProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(lead.min_requirements ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!open) setDraft(lead.min_requirements ?? "");
  }, [lead.min_requirements, open]);

  function handleOpen() {
    setDraft(lead.min_requirements ?? "");
    setOpen(true);
  }

  function handleSave(closeAfter = true) {
    const value = draft.trim() || null;
    if (value === (lead.min_requirements?.trim() || null)) {
      if (closeAfter) setOpen(false);
      return;
    }

    startTransition(async () => {
      const result = await updateLead(lead.id, { min_requirements: value });
      if (!result.ok) return;
      router.refresh();
      if (closeAfter) setOpen(false);
    });
  }

  const preview = previewText(lead.min_requirements);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full min-w-0 items-start gap-1.5 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-1.5 text-left text-sm transition-colors hover:border-[var(--color-primary)] hover:bg-white"
        aria-label={preview ? "View and edit minimum requirements" : "Add minimum requirements"}
      >
        <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
        <span className="min-w-0 flex-1 line-clamp-2 break-words text-[var(--color-foreground)]">
          {preview ?? (
            <span className="text-[var(--color-muted-foreground)]">Add requirements…</span>
          )}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Min Requirements</DialogTitle>
            <DialogDescription>
              {lead.employer}
              {lead.position ? ` — ${lead.position}` : ""}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste the full minimum requirements from the job posting. Click this cell any time to read or edit them."
            className="min-h-[280px] resize-y text-sm leading-relaxed"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Close
            </Button>
            <Button type="button" onClick={() => handleSave(true)} disabled={isPending}>
              {isPending ? "Saving…" : "Save & Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
