"use client";

import { useCallback, useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { UserActivityChart } from "./_components/user-activity-chart";
import { UserKpiCards } from "./_components/user-kpi-cards";
import { UserTable } from "./_components/user-table";
import type { ActivitySummary, UserRow } from "./types";

export default function UserPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, summaryRes] = await Promise.all([fetch("/api/users"), fetch("/api/users/activity-summary")]);
      if (!usersRes.ok || !summaryRes.ok) throw new Error("Failed to fetch");
      const [usersData, summaryData] = await Promise.all([usersRes.json(), summaryRes.json()]);
      setUsers(usersData);
      setSummary(summaryData);
      setError(null);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["total", "dau", "wau", "mau"].map((k) => (
            <Skeleton key={k} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
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
        <h1 className="font-bold text-2xl">Users</h1>
        <p className="mt-1 text-muted-foreground text-sm">System usage overview and user list</p>
      </div>
      {summary && <UserKpiCards summary={summary} />}
      {summary && <UserActivityChart daily={summary.daily} />}
      <UserTable data={users} />
    </div>
  );
}
