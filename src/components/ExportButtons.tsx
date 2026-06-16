"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv, exportToExcel } from "@/lib/export";
import type { JobLead } from "@/lib/types";

interface ExportButtonsProps {
  leads: JobLead[];
}

export function ExportButtons({ leads }: ExportButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => exportToCsv(leads)} disabled={leads.length === 0}>
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportToExcel(leads)} disabled={leads.length === 0}>
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
}