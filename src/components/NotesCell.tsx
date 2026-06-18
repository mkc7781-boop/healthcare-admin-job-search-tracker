"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { StickyNote } from "lucide-react";
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

interface NotesCellProps {
  lead: JobLead;
}

function previewText(notes: string | null) {
  if (!notes?.trim()) return null;
  const text = notes.trim();
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export function NotesCell({ lead }: NotesCellProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(lead.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!open) setDraft(lead.notes ?? "");
  }, [lead.notes, open]);

  function handleOpen() {
    setDraft(lead.notes ?? "");
    setOpen(true);
  }

  function handleSave(closeAfter = true) {
    const value = draft.trim() || null;
    if (value === (lead.notes?.trim() || null)) {
      if (closeAfter) setOpen(false);
      return;
    }

    startTransition(async () => {
      const result = await updateLead(lead.id, { notes: value });
      if (!result.ok) return;
      router.refresh();
      if (closeAfter) setOpen(false);
    });
  }

  const preview = previewText(lead.notes);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full min-w-[120px] max-w-[180px] items-start gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-2 py-1.5 text-left text-sm transition-colors hover:border-[var(--color-primary)] hover:bg-white"
        aria-label={preview ? "View and edit notes" : "Add notes"}
      >
        <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
        <span className="line-clamp-2 text-[var(--color-foreground)]">
          {preview ?? <span className="text-[var(--color-muted-foreground)]">Add notes…</span>}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notes</DialogTitle>
            <DialogDescription>
              {lead.employer}
              {lead.position ? ` — ${lead.position}` : ""}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write as much as you need — interview prep, salary info, why this job fits, follow-up reminders…"
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