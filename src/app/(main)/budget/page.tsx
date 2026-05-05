"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  BudgetData,
  BudgetItemSummary,
  BudgetRow,
  BudgetSummary,
  ProjectSummary,
} from "@/lib/budget";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BudgetDetailTable } from "./_components/budget-detail-table";
import { BudgetDetailUploadButton } from "./_components/budget-detail-upload-button";
import { BudgetItemsBreakdown } from "./_components/budget-items-breakdown";
import { BudgetKpiCards } from "./_components/budget-kpi-cards";
import { BudgetProjectChart } from "./_components/budget-project-chart";
import { BudgetUploadButton } from "./_components/budget-upload-button";
import { BudgetUtilization } from "./_components/budget-utilization";
import { useSession } from "next-auth/react";

function aggregateFiltered(rows: BudgetRow[]) {
  const summary: BudgetSummary = {
    totalBudgetTHB: rows.reduce((s, r) => s + Number(r.budgetTHB), 0),
    totalReservedTHB: rows.reduce((s, r) => s + Number(r.reservedTHB), 0),
    totalActualTHB: rows.reduce((s, r) => s + Number(Math.abs(r.actualTHB)), 0),
    totalAvailableTHB: rows.reduce((s, r) => s + Number(r.availableTHB), 0),
    totalBudgetUSD: rows.reduce((s, r) => s + Number(r.budgetUSD), 0),
    totalReservedUSD: rows.reduce((s, r) => s + Number(r.reservedUSD), 0),
    totalActualUSD: rows.reduce((s, r) => s + Number(r.actualUSD), 0),
    totalAvailableUSD: rows.reduce((s, r) => s + Number(r.availableUSD), 0),
  };

  const projectMap = new Map<string, ProjectSummary>();
  for (const row of rows) {
    if (!projectMap.has(row.projectType)) {
      projectMap.set(row.projectType, {
        projectType: row.projectType,
        projectName: row.projectTypeName,
        budgetTHB: 0,
        reservedTHB: 0,
        actualTHB: 0,
        availableTHB: 0,
        budgetUSD: 0,
        reservedUSD: 0,
        actualUSD: 0,
        availableUSD: 0,
      });
    }
    const p = projectMap.get(row.projectType)!;
    p.budgetTHB += Number(row.budgetTHB);
    p.reservedTHB += Number(row.reservedTHB);
    p.actualTHB += Number(Math.abs(row.actualTHB));
    p.availableTHB += Number(row.availableTHB);
    p.budgetUSD += Number(row.budgetUSD);
    p.reservedUSD += Number(row.reservedUSD);
    p.actualUSD += Number(row.actualUSD);
    p.availableUSD += Number(row.availableUSD);
  }
  const byProject = Array.from(projectMap.values()).filter(
    (p) =>
      Math.abs(p.budgetTHB) + Math.abs(p.actualTHB) + Math.abs(p.reservedTHB) >
      0,
  );

  const itemMap = new Map<string, BudgetItemSummary>();
  for (const row of rows) {
    if (!itemMap.has(row.budgetItemName)) {
      itemMap.set(row.budgetItemName, {
        budgetItemName: row.budgetItemName,
        budgetTHB: 0,
        reservedTHB: 0,
        actualTHB: 0,
        budgetUSD: 0,
        reservedUSD: 0,
        actualUSD: 0,
        createdAt: new Date(),
      });
    }
    const item = itemMap.get(row.budgetItemName)!;
    item.budgetTHB += Number(row.budgetTHB);
    item.reservedTHB += Number(row.reservedTHB);
    item.actualTHB += Number(row.actualTHB);
    item.budgetUSD += Number(row.budgetUSD);
    item.reservedUSD += Number(row.reservedUSD);
    item.actualUSD += Number(row.actualUSD);
  }
  const byBudgetItem = Array.from(itemMap.values())
    .filter((i) => Math.abs(i.budgetTHB) + Math.abs(i.actualTHB) > 0)
    .sort((a, b) => b.budgetTHB - a.budgetTHB);

  return { summary, byProject, byBudgetItem };
}

export default function BudgetPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectNameFilter, setProjectNameFilter] = useState("all");

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

  const ChatWidget = () => {
    const chatRef = useRef(null);

    useEffect(() => {
      const el = chatRef.current;

      const handler = (e: any) => {
        console.log(e.detail.text);
      };

      el.addEventListener("send", handler);

      return () => {
        el.removeEventListener("send", handler);
      };
    }, []);

    return <ai-chat-popup ref={chatRef}></ai-chat-popup>;
  };

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const activeRows = useMemo(
    () =>
      data?.rows.filter(
        (r) =>
          Math.abs(r.budgetTHB) +
            Math.abs(r.actualTHB) +
            Math.abs(r.reservedTHB) >
          0,
      ) ?? [],
    [data],
  );

  const projectOptions = useMemo(
    () =>
      Array.from(
        new Map(
          activeRows.map((r) => [r.projectType, r.projectTypeName]),
        ).entries(),
      ).sort((a, b) => a[1].localeCompare(b[1])),
    [activeRows],
  );

  const projectNameOptions = useMemo(
    () =>
      Array.from(new Set(activeRows.map((r) => r.projectTypeName)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [activeRows],
  );

  const filteredRows = useMemo(() => {
    return activeRows.filter((r) => {
      const matchesProject =
        projectFilter === "all" || r.projectType === projectFilter;
      const matchesProjectName =
        projectNameFilter === "all" || r.projectTypeName === projectNameFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.projectTypeName.toLowerCase().includes(q) ||
        r.budgetItemName.toLowerCase().includes(q) ||
        r.projectType.toLowerCase().includes(q);
      return matchesProject && matchesProjectName && matchesSearch;
    });
  }, [activeRows, search, projectFilter, projectNameFilter]);

  const filtered = useMemo(
    () => aggregateFiltered(filteredRows),
    [filteredRows],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-2xl">Budget Dashboard</h1>

          {data?.rows.length && (
            <p className="mt-1 text-muted-foreground text-sm">
              last updated on {new Date(data?.rows[0].createdAt).toDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {(() => {
            const email = session?.user?.email?.toLocaleLowerCase();
            const canUpload =
              email === "thanabutc@rovula.com" ||
              email === "nuttapongsa@rovula.com";
            if (!canUpload) return null;
            return (
              <>
                <BudgetUploadButton onSuccess={fetchBudget} />
                <BudgetDetailUploadButton />
              </>
            );
          })()}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by project or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {/* <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projectOptions.map(([type, name]) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        <Select value={projectNameFilter} onValueChange={setProjectNameFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All project names" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projectNameOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || projectFilter !== "all" || projectNameFilter !== "all") && (
          <p className="text-muted-foreground text-sm">
            Showing {filteredRows.length} of {activeRows.length} items
          </p>
        )}
      </div>

      {loading && (
        <p className="text-muted-foreground text-sm">Loading budget data...</p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
      {data && (
        <>
          <BudgetKpiCards summary={filtered.summary} />
          <BudgetDetailTable rows={filteredRows} />
          <BudgetProjectChart byProject={filtered.byProject} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BudgetUtilization byProject={filtered.byProject} />
            <BudgetItemsBreakdown byBudgetItem={filtered.byBudgetItem} />
          </div>
        </>
      )}
    </div>
  );
}
