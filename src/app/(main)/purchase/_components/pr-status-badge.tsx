"use client";

import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SUBMITTED: { label: "Submitted", variant: "default" },
  APPROVED: { label: "Approved", variant: "outline" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
};

export function PRStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
