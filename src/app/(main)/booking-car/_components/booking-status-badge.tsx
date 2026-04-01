"use client";

import type { CarBookingStatus } from "@/lib/booking-car";
import { formatStatus, getStatusColor } from "@/lib/booking-car";
import { cn } from "@/lib/utils";

interface BookingStatusBadgeProps {
  status: CarBookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        getStatusColor(status),
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
