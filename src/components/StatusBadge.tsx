import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";
import type { Status } from "@/lib/types";

const variants: Record<Status, "info" | "warning" | "success" | "muted"> = {
  need_to_apply: "info",
  applied: "warning",
  interviewing: "success",
  rejected: "muted",
};

export function StatusBadge({ status }: { status: Status }) {
  const label = STATUS_LABELS[status] ?? status;
  const variant = variants[status] ?? "muted";
  return <Badge variant={variant}>{label}</Badge>;
}