"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLead, updateLead } from "@/lib/actions";
import { PRIORITY_LABELS, REGIONS, STATUS_LABELS } from "@/lib/constants";
import type { JobLead, Priority, Region, Status } from "@/lib/types";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region?: Region;
  lead?: JobLead;
}

const emptyForm = (region: Region) => ({
  region,
  employer: "",
  career_site: "",
  position: "",
  city: "",
  min_requirements: "",
  priority: "medium" as Priority,
  status: "need_to_apply" as Status,
  date_applied: "",
  follow_up_date: "",
  due_date: "",
  contact_recruiter: "",
  notes: "",
});

export function LeadForm({ open, onOpenChange, region = "sacramento", lead }: LeadFormProps) {
  const [form, setForm] = useState(() =>
    lead
      ? {
          region: lead.region,
          employer: lead.employer,
          career_site: lead.career_site ?? "",
          position: lead.position ?? "",
          city: lead.city ?? "",
          min_requirements: lead.min_requirements ?? "",
          priority: lead.priority,
          status: lead.status,
          date_applied: lead.date_applied ?? "",
          follow_up_date: lead.follow_up_date ?? "",
          due_date: lead.due_date ?? "",
          contact_recruiter: lead.contact_recruiter ?? "",
          notes: lead.notes ?? "",
        }
      : emptyForm(region)
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(lead);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.employer.trim()) {
      setError("Employer is required.");
      return;
    }

    const payload = {
      region: form.region,
      employer: form.employer.trim(),
      career_site: form.career_site.trim() || null,
      position: form.position.trim() || null,
      city: form.city.trim() || null,
      min_requirements: form.min_requirements.trim() || null,
      priority: form.priority,
      status: form.status,
      date_applied: form.date_applied || null,
      follow_up_date: form.follow_up_date || null,
      due_date: form.due_date || null,
      contact_recruiter: form.contact_recruiter.trim() || null,
      notes: form.notes.trim() || null,
    };

    startTransition(async () => {
      try {
        if (isEdit && lead) {
          await updateLead(lead.id, payload);
        } else {
          await createLead(payload);
        }
        onOpenChange(false);
        if (!isEdit) setForm(emptyForm(region));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lead" : "Add Lead"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this job lead."
              : "Add a new job lead to this region."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="region">Region</Label>
            <Select
              value={form.region}
              onValueChange={(value) => updateField("region", value as Region)}
              disabled={isEdit}
            >
              <SelectTrigger id="region">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="employer">Employer *</Label>
              <Input
                id="employer"
                value={form.employer}
                onChange={(e) => updateField("employer", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="career_site">Career Site</Label>
              <Input
                id="career_site"
                type="url"
                placeholder="https://"
                value={form.career_site}
                onChange={(e) => updateField("career_site", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => updateField("position", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="min_requirements">Min Requirements</Label>
              <Textarea
                id="min_requirements"
                value={form.min_requirements}
                onChange={(e) => updateField("min_requirements", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) => updateField("priority", value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => updateField("status", value as Status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date_applied">Date Applied</Label>
              <Input
                id="date_applied"
                type="date"
                value={form.date_applied}
                onChange={(e) => updateField("date_applied", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="follow_up_date">Follow-up</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={form.follow_up_date}
                onChange={(e) => updateField("follow_up_date", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={form.due_date}
                onChange={(e) => updateField("due_date", e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="contact_recruiter">Contact Recruiter</Label>
              <Input
                id="contact_recruiter"
                value={form.contact_recruiter}
                onChange={(e) => updateField("contact_recruiter", e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}