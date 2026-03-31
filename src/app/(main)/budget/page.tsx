"use client";

import { useCallback, useEffect, useState } from "react";

import type { BudgetData } from "@/lib/budget";

import { BudgetDetailTable } from "./_components/budget-detail-table";
import { BudgetItemsBreakdown } from "./_components/budget-items-breakdown";
import { BudgetKpiCards } from "./_components/budget-kpi-cards";
import { BudgetProjectChart } from "./_components/budget-project-chart";
import { BudgetUploadButton } from "./_components/budget-upload-button";
import { BudgetUtilization } from "./_components/budget-utilization";
import { useSession } from "next-auth/react";

export default function BudgetPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/budget", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to load budget data");
      const json: BudgetData = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-2xl">Budget Dashboard</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Budget overview across all projects
          </p>
        </div>
        {session?.user?.email?.toLocaleLowerCase() ===
          "thanabutC@rovula.com" && (
          <BudgetUploadButton onSuccess={fetchBudget} />
        )}
      </div>

      {loading && (
        <p className="text-muted-foreground text-sm">Loading budget data...</p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
      {data && (
        <>
          <BudgetKpiCards summary={data.summary} />
          <BudgetDetailTable rows={data.rows} />
          <BudgetProjectChart byProject={data.byProject} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BudgetUtilization byProject={data.byProject} />
            <BudgetItemsBreakdown byBudgetItem={data.byBudgetItem} />
          </div>
        </>
      )}
    </div>
  );
}
