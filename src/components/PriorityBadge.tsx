import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS } from "@/lib/constants";
import type { Priority } from "@/lib/types";

const variants: Record<Priority, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const label = PRIORITY_LABELS[priority] ?? priority;
  const variant = variants[priority] ?? "secondary";
  return <Badge variant={variant}>{label}</Badge>;
}