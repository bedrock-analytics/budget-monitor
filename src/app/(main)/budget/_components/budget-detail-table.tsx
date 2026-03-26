"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatTHB, formatUSD } from "@/lib/utils";
import type { BudgetRow } from "@/lib/budget";

interface Props {
  rows: BudgetRow[];
}

export function BudgetDetailTable({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  const activeRows = rows.filter(
    (r) =>
      Math.abs(r.budgetTHB) + Math.abs(r.actualTHB) + Math.abs(r.reservedTHB) >
      0,
  );

  const projectOptions = Array.from(
    new Map(
      activeRows.map((r) => [r.projectType, r.projectTypeName]),
    ).entries(),
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const filtered = activeRows.filter((r) => {
    const matchesProject =
      projectFilter === "all" || r.projectType === projectFilter;
    const matchesSearch =
      r.projectTypeName.toLowerCase().includes(search.toLowerCase()) ||
      r.budgetItemName.toLowerCase().includes(search.toLowerCase()) ||
      r.projectType.toLowerCase().includes(search.toLowerCase());
    return matchesProject && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Line Items</CardTitle>
        <CardDescription>
          All active budget entries ({filtered.length} of {activeRows.length}{" "}
          items)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search by project or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projectOptions.map(([type, name]) => (
                <SelectItem key={type} value={type}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Project
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Budget item name
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Budget
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Reserved
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actual
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Available
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                return (
                  <tr
                    key={`${row.projectType}-${row.budgetItemName}-${i}`}
                    className="border-b transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{row.projectTypeName}</div>
                      <div className="text-muted-foreground text-xs">
                        {row.projectType}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {row.budgetItemName}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${row.budgetTHB < 0 ? "text-destructive" : ""}
                        ${row.budgetTHB === 0 ? "text-muted-foreground" : ""}
                        `}
                    >
                      <div>{formatTHB(row.budgetTHB)}</div>
                      <div>{formatUSD(row.budgetUSD)}</div>
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${row.reservedTHB < 0 ? "text-destructive" : ""}
                       ${row.reservedTHB === 0 ? "text-muted-foreground" : ""}
                       `}
                    >
                      <div>{formatTHB(row.reservedTHB)}</div>
                      <div>{formatUSD(row.reservedUSD)}</div>
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${row.actualTHB < 0 ? "text-destructive" : ""}
                       ${row.actualTHB === 0 ? "text-muted-foreground" : ""}
                       `}
                    >
                      <div>{formatTHB(row.actualTHB)} THB</div>
                      <div>{formatUSD(row.actualUSD)}</div>
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${row.availableTHB < 0 ? "text-destructive" : ""}
                       ${row.availableTHB === 0 ? "text-muted-foreground" : ""}`}
                    >
                      <div>{formatTHB(row.availableTHB)}</div>
                      <div>{formatUSD(row.availableUSD)}</div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No matching items found.
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 &&
              (() => {
                const totalBudgetTHB = filtered.reduce(
                  (s, r) => s + Number(r.budgetTHB),
                  0,
                );
                const totalBudgetUSD = filtered.reduce(
                  (s, r) => s + Number(r.budgetUSD),
                  0,
                );
                const totalReservedTHB = filtered.reduce(
                  (s, r) => s + Number(r.reservedTHB),
                  0,
                );
                const totalReservedUSD = filtered.reduce(
                  (s, r) => s + Number(r.reservedUSD),
                  0,
                );
                const totalActualTHB = filtered.reduce(
                  (s, r) => s + Number(r.actualTHB),
                  0,
                );
                const totalActualUSD = filtered.reduce(
                  (s, r) => s + Number(r.actualUSD),
                  0,
                );
                const totalAvailableTHB = filtered.reduce(
                  (s, r) => s + Number(r.availableTHB),
                  0,
                );
                const totalAvailableUSD = filtered.reduce(
                  (s, r) => s + Number(r.availableUSD),
                  0,
                );
                return (
                  <tfoot>
                    <tr className="border-t-2 bg-muted/50 font-semibold">
                      <td className="px-4 py-2.5" colSpan={2}>
                        Total ({filtered.length} items)
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right tabular-nums ${totalBudgetTHB < 0 ? "text-destructive" : ""}`}
                      >
                        <div>{formatTHB(totalBudgetTHB)}</div>
                        <div>{formatUSD(totalBudgetUSD)}</div>
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right tabular-nums ${totalReservedTHB < 0 ? "text-destructive" : ""}`}
                      >
                        <div>{formatTHB(totalReservedTHB)}</div>
                        <div>{formatUSD(totalReservedUSD)}</div>
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right tabular-nums ${totalActualTHB < 0 ? "text-destructive" : ""}`}
                      >
                        <div>{formatTHB(totalActualTHB)} THB</div>
                        <div>{formatUSD(totalActualUSD)}</div>
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right tabular-nums ${totalAvailableTHB < 0 ? "text-destructive" : ""}`}
                      >
                        <div>{formatTHB(totalAvailableTHB)}</div>
                        <div>{formatUSD(totalAvailableUSD)}</div>
                      </td>
                    </tr>
                  </tfoot>
                );
              })()}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
