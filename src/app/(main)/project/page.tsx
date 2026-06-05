"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUSD } from "@/lib/utils";

import { CostTrackingUploadButton } from "./_components/cost-tracking-upload-button";
import type { ProjectListItem } from "./_components/types";

type SortKey =
  | "projectCode"
  | "projectName"
  | "startDate"
  | "endDate"
  | "budgetUSD"
  | "estimateUSD"
  | "actualChargeUSD"
  | "marginUSD"
  | "spentPct";

type SortDir = "asc" | "desc";

interface Row extends ProjectListItem {
  budget: number;
  estimate: number;
  actual: number;
  margin: number;
  marginPct: number;
  available: number;
  spentPct: number;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString() : "—";

export default function ProjectOverviewPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("projectCode");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cost-tracking");
      if (!res.ok) throw new Error("Failed to load projects");
      const data: ProjectListItem[] = await res.json();
      setProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const canUpload = useMemo(() => {
    const email = session?.user?.email?.toLowerCase();
    return (
      email === "thanabutc@rovula.com" || email === "nuttapongsa@rovula.com"
    );
  }, [session]);

  const rows = useMemo<Row[]>(() => {
    return projects.map((p) => {
      const budget = Number(p.budgetUSD);
      const estimate = Number(p.estimateUSD);
      const actual = Number(p.actualChargeUSD);
      const margin = budget - actual;
      const marginPct = budget > 0 ? (margin / budget) * 100 : 0;
      const available = budget - estimate;
      const spentPct = estimate > 0 ? (actual / estimate) * 100 : 0;
      return {
        ...p,
        budget,
        estimate,
        actual,
        margin,
        marginPct,
        available,
        spentPct,
      };
    });
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.projectCode.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortKey) {
        case "projectCode":
        case "projectName":
          av = a[sortKey].toLowerCase();
          bv = b[sortKey].toLowerCase();
          break;
        case "startDate":
        case "endDate":
          av = a[sortKey] ? new Date(a[sortKey] as string).getTime() : 0;
          bv = b[sortKey] ? new Date(b[sortKey] as string).getTime() : 0;
          break;
        case "budgetUSD":
          av = a.budget;
          bv = b.budget;
          break;
        case "estimateUSD":
          av = a.estimate;
          bv = b.estimate;
          break;
        case "actualChargeUSD":
          av = a.actual;
          bv = b.actual;
          break;
        case "marginUSD":
          av = a.marginPct;
          bv = b.marginPct;
          break;
        case "spentPct":
          av = a.spentPct;
          bv = b.spentPct;
          break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.budget += r.budget;
        acc.estimate += r.estimate;
        acc.actual += r.actual;
        acc.margin += r.margin;
        acc.available += r.available;
        return acc;
      },
      { budget: 0, estimate: 0, actual: 0, margin: 0, available: 0 },
    );
  }, [filtered]);

  const totalSpentPct =
    totals.estimate > 0 ? (totals.actual / totals.estimate) * 100 : 0;
  const totalMarginPct =
    totals.budget > 0 ? (totals.margin / totals.budget) * 100 : 0;
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key)
      return (
        <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground" />
      );
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    );
  };

  const kpis = [
    {
      title: "Total Revenue",
      value: formatUSD(totals.budget),
      tone: "default" as const,
    },
    {
      title: "Cost Reserved ",
      value: formatUSD(totals.estimate),
      tone: "default" as const,
    },
    {
      title: "Total Actual",
      value: formatUSD(totals.actual),
      tone: "default" as const,
    },
    {
      title: "Total Margin",
      // value: `${formatUSD(totals.margin)} (${totalMarginPct.toFixed(1)}%)`,
      value: `${totalMarginPct.toFixed(1)}%`,
      tone: totals.margin < 0 ? ("danger" as const) : ("good" as const),
    },
    {
      title: "Remaining",
      value: formatUSD(totals.available),
      tone: totals.available < 0 ? ("danger" as const) : ("good" as const),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-2xl">Projects</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {filtered.length} of {projects.length} projects
          </p>
        </div>
        {canUpload && <CostTrackingUploadButton onSuccess={fetchProjects} />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.title} data-slot="card">
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">
                {k.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`font-bold text-2xl tabular-nums ${
                  k.tone === "danger"
                    ? "text-destructive"
                    : k.tone === "good"
                      ? "text-green-600"
                      : ""
                }`}
              >
                {k.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search code or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        {loading && (
          <span className="text-muted-foreground text-sm">
            Loading projects...
          </span>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {!loading && projects.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="font-medium">No projects yet</p>
          <p className="mt-1 text-muted-foreground text-sm">
            {canUpload
              ? "Upload a cost-tracking CSV to get started."
              : "Ask an administrator to upload a cost-tracking CSV."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("projectCode")}
                >
                  Code{sortIcon("projectCode")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("projectName")}
                >
                  Name{sortIcon("projectName")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("startDate")}
                >
                  Start{sortIcon("startDate")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("endDate")}
                >
                  End{sortIcon("endDate")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("budgetUSD")}
                >
                  Revenue{sortIcon("budgetUSD")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("estimateUSD")}
                >
                  Cost Reserved{sortIcon("estimateUSD")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("actualChargeUSD")}
                >
                  Cost Actual{sortIcon("actualChargeUSD")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("marginUSD")}
                >
                  Margin{sortIcon("marginUSD")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("spentPct")}
                >
                  % Spent{sortIcon("spentPct")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r) => (
                <TableRow key={r.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link
                      href={`/project/${encodeURIComponent(r.projectCode)}`}
                      className="hover:underline"
                    >
                      {r.projectCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/project/${encodeURIComponent(r.projectCode)}`}
                      className="hover:underline"
                    >
                      {r.projectName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(r.startDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(r.endDate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatUSD(r.budget)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatUSD(r.estimate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatUSD(r.actual)}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${r.margin < 0 ? "text-destructive" : "text-green-600"}`}
                  >
                    {r.marginPct.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${r.spentPct > 100 ? "text-destructive" : ""}`}
                  >
                    {r.spentPct.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No projects match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {sorted.length > 0 && (
              <TableFooter>
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={4}>Total ({filtered.length})</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatUSD(totals.budget)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatUSD(totals.estimate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatUSD(totals.actual)}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${totals.margin < 0 ? "text-destructive" : "text-green-600"}`}
                  >
                    {totalMarginPct.toFixed(1)}%
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${totalSpentPct > 100 ? "text-destructive" : ""}`}
                  >
                    {totalSpentPct.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      )}
    </div>
  );
}
