"use client";

import { useCallback, useEffect, useState } from "react";

import type { PurchaseRequestRow } from "@/lib/purchase-request";

import { Skeleton } from "@/components/ui/skeleton";

import { PRTable } from "./_components/pr-table";

export default function PurchaseRequestPage() {
  const [data, setData] = useState<PurchaseRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/purchase-request");
      if (!res.ok) throw new Error("Failed to fetch");
      const rows = await res.json();
      setData(rows);
      setError(null);
    } catch {
      setError("Failed to load purchase requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      try {
        const res = await fetch(`/api/purchase-request/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update status");
        fetchData();
      } catch {
        alert("Failed to update status");
      }
    },
    [fetchData],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this purchase request?")) return;
      try {
        const res = await fetch(`/api/purchase-request/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete");
        fetchData();
      } catch {
        alert("Failed to delete purchase request");
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
      <div>
        <h1 className="font-bold text-2xl">Purchase Requests</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage purchase requests with budget integration
        </p>
      </div>
      <PRTable
        data={data}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
