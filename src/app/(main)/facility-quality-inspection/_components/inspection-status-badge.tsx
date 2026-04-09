"use client";

import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SCHEDULED: { label: "Scheduled", variant: "outline" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  COMPLETED: { label: "Completed", variant: "outline" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export function InspectionStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const resultConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PASS: { label: "YES", variant: "default" },
  FAIL: { label: "NO", variant: "destructive" },
  CONDITIONAL: { label: "Conditional", variant: "outline" },
  PENDING: { label: "Pending", variant: "secondary" },
  NA: { label: "N/A", variant: "secondary" },
};

export function InspectionResultBadge({ result }: { result: string }) {
  const config = resultConfig[result] ?? { label: result, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> =
  {
    High: { label: "High", variant: "destructive" },
    Medium: { label: "Medium", variant: "outline" },
    Low: { label: "Low", variant: "secondary" },
  };

export function InspectionPriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return <span className="text-muted-foreground">-</span>;
  const config = priorityConfig[priority] ?? { label: priority, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
