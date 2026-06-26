"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { CarBookingRow, CarBookingStatus } from "@/lib/booking-car";

import { BookingTable } from "./_components/booking-table";

export default function BookingCarPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<CarBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/booking-car");
      if (!res.ok) throw new Error("Failed to fetch");
      const rows = await res.json();
      setData(rows);
      setError(null);
    } catch {
      setError("Failed to load car bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        row.carName.toLowerCase().includes(q) ||
        row.licensePlate.toLowerCase().includes(q) ||
        row.bookingNumber.toLowerCase().includes(q) ||
        row.purpose.toLowerCase().includes(q) ||
        (row.user.name || row.user.email).toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [data, search, statusFilter]);

  const handleStatusChange = useCallback(
    async (id: string, status: CarBookingStatus) => {
      try {
        const res = await fetch(`/api/booking-car/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update status");
        fetchData();
      } catch {
        alert("Failed to update booking status");
      }
    },
    [fetchData],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this booking?")) return;
      try {
        const res = await fetch(`/api/booking-car/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete");
        fetchData();
      } catch {
        alert("Failed to delete booking");
      }
    },
    [fetchData],
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-2xl">Car Booking</h1>
          <p className="mt-1 text-muted-foreground text-sm">Book and manage company car reservations</p>
        </div>
        <Button asChild>
          <Link href="/booking-car/create">
            <Plus data-icon="inline-start" />
            New Booking
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by car, booking #, or person..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="IN_USE">In Use</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && (
          <p className="text-muted-foreground text-sm">
            Showing {filteredData.length} of {data.length} bookings
          </p>
        )}
      </div>

      <BookingTable
        data={filteredData}
        // currentUserId={session?.user?.id}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
