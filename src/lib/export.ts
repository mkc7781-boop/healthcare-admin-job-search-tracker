import * as XLSX from "xlsx";
import {
  EXPORT_COLUMNS,
  PRIORITY_LABELS,
  REGIONS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { JobLead } from "@/lib/types";

function regionLabel(region: JobLead["region"]) {
  return REGIONS.find((r) => r.id === region)?.label ?? region;
}

function leadToRow(lead: JobLead): string[] {
  return [
    regionLabel(lead.region),
    lead.employer,
    lead.career_site ?? "",
    lead.position ?? "",
    lead.city ?? "",
    lead.min_requirements ?? "",
    PRIORITY_LABELS[lead.priority],
    STATUS_LABELS[lead.status],
    lead.date_applied ?? "",
    lead.follow_up_date ?? "",
    lead.due_date ?? "",
    lead.contact_recruiter ?? "",
    lead.notes ?? "",
  ];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(leads: JobLead[]) {
  const rows = [Array.from(EXPORT_COLUMNS), ...leads.map(leadToRow)];
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `job-leads-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportToExcel(leads: JobLead[]) {
  const rows = [Array.from(EXPORT_COLUMNS), ...leads.map(leadToRow)];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Job Leads");
  XLSX.writeFile(workbook, `job-leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
}