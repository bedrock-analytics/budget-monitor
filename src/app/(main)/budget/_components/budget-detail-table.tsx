"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { formatTHB, formatUSD } from "@/lib/utils";
import type { BudgetRow } from "@/lib/budget";

interface BudgetDetailRecord {
  id: string;
  projectType: string;
  projectCode: string;
  budgetCategory: string;
  budgetItemName: string;
  system: string;
  type: string;
  no: string;
  acctCode: string;
  accountName: string;
  date: string | null;
  vendor: string;
  remark: string;
  reservedTHB: string | number;
  actualTHB: string | number;
  totalSpentTHB: string | number;
  rate: string | number;
  reservedUSD: string | number;
  actualUSD: string | number;
  totalSpentUSD: string | number;
  creator: string;
}

interface Props {
  rows: BudgetRow[];
}

function rowKey(projectType: string, budgetItemName: string) {
  return `${projectType}__${budgetItemName}`;
}

export function BudgetDetailTable({ rows }: Props) {
  const [details, setDetails] = useState<BudgetDetailRecord[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<BudgetRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDetailsLoading(true);
      setDetailsError(null);
      try {
        const res = await fetch("/api/budget-detail");
        if (!res.ok) throw new Error("Failed to load budget detail");
        const json = (await res.json()) as BudgetDetailRecord[];
        if (!cancelled) setDetails(json);
      } catch (e) {
        if (!cancelled) {
          setDetailsError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const detailsByKey = useMemo(() => {
    const map = new Map<string, BudgetDetailRecord[]>();
    for (const d of details) {
      const k = rowKey(d.projectType, d.budgetItemName);
      const bucket = map.get(k);
      if (bucket) bucket.push(d);
      else map.set(k, [d]);
    }
    return map;
  }, [details]);

  const selectedMatches = selected
    ? (detailsByKey.get(
        rowKey(selected.projectType, selected.budgetItemName),
      ) ?? [])
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Line Items</CardTitle>
        <CardDescription>
          {rows.length} active budget entries
          {detailsLoading && " · loading details..."}
          {detailsError && ` · ${detailsError}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              {rows.map((row, i) => {
                const key = rowKey(row.projectType, row.budgetItemName);
                const matches = detailsByKey.get(key) ?? [];
                const hasDetails = matches.length > 0;
                return (
                  <tr
                    key={`${row.projectType}-${row.budgetItemName}-${i}`}
                    className={`border-b transition-colors last:border-0 hover:bg-muted/30 ${
                      hasDetails ? "cursor-pointer" : ""
                    }`}
                    onClick={hasDetails ? () => setSelected(row) : undefined}
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{row.projectTypeName}</div>
                      <div className="text-muted-foreground text-xs">
                        {row.projectType}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {row.budgetItemName}
                      {hasDetails && (
                        <span className="ml-2 text-xs">
                          ({matches.length}{" "}
                          {matches.length === 1 ? "entry" : "entries"})
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${row.budgetTHB < 0 ? "text-destructive" : ""}
                        ${Number(row.budgetTHB) === 0 ? "text-muted-foreground" : ""}
                        `}
                    >
                      <div>{formatTHB(row.budgetTHB)}</div>
                      <div>{formatUSD(row.budgetUSD)}</div>
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${row.reservedTHB < 0 ? "text-destructive" : ""}
                       ${Number(row.reservedTHB) === 0 ? "text-muted-foreground" : ""}
                       `}
                    >
                      <div>{formatTHB(row.reservedTHB)}</div>
                      <div>{formatUSD(row.reservedUSD)}</div>
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${row.actualTHB < 0 ? "text-destructive" : ""}
                       ${Number(row.actualTHB) === 0 ? "text-muted-foreground" : ""}
                       `}
                    >
                      <div>{formatTHB(row.actualTHB)}</div>
                      <div>{formatUSD(row.actualUSD)}</div>
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${row.availableTHB < 0 ? "text-destructive" : ""}
                       ${Number(row.availableTHB) === 0 ? "text-muted-foreground" : ""}`}
                    >
                      <div>{formatTHB(row.availableTHB)}</div>
                      <div>{formatUSD(row.availableUSD)}</div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
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
            {rows.length > 0 &&
              (() => {
                const totalBudgetTHB = rows.reduce(
                  (s, r) => s + Number(r.budgetTHB),
                  0,
                );
                const totalBudgetUSD = rows.reduce(
                  (s, r) => s + Number(r.budgetUSD),
                  0,
                );
                const totalReservedTHB = rows.reduce(
                  (s, r) => s + Number(r.reservedTHB),
                  0,
                );
                const totalReservedUSD = rows.reduce(
                  (s, r) => s + Number(r.reservedUSD),
                  0,
                );
                const totalActualTHB = rows.reduce(
                  (s, r) => s + Number(r.actualTHB),
                  0,
                );
                const totalActualUSD = rows.reduce(
                  (s, r) => s + Number(r.actualUSD),
                  0,
                );
                const totalAvailableTHB = rows.reduce(
                  (s, r) => s + Number(r.availableTHB),
                  0,
                );
                const totalAvailableUSD = rows.reduce(
                  (s, r) => s + Number(r.availableUSD),
                  0,
                );
                return (
                  <tfoot>
                    <tr className="border-t-2 bg-muted/50 font-semibold">
                      <td className="px-4 py-2.5" colSpan={2}>
                        Total ({rows.length} items)
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
                        className={`px-4 py-2.5 text-right tabular-nums ${Number(Math.abs(totalActualTHB)) < 0 ? "text-destructive" : ""}`}
                      >
                        <div>{formatTHB(Math.abs(totalActualTHB))}</div>
                        <div>{formatUSD(Math.abs(totalActualUSD))}</div>
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

      <Dialog
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[96vw]">
          <DialogHeader>
            <DialogTitle>
              {selected?.projectTypeName}{" "}
              <span className="text-muted-foreground text-sm font-normal">
                ({selected?.projectType})
              </span>
            </DialogTitle>
            <DialogDescription>
              {selected?.budgetItemName} · {selectedMatches.length}{" "}
              {selectedMatches.length === 1 ? "entry" : "entries"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-auto rounded-md border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/60">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    No.
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Account
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Vendor
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Remark
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Reserved
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Actual
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Total Spent
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Rate
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Creator
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedMatches.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {d.date ? new Date(d.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {d.type || "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {d.no || "—"}
                    </td>
                    <td className="px-3 py-2">{d.budgetCategory || "—"}</td>
                    <td className="px-3 py-2">{d.accountName || "—"}</td>
                    <td className="px-3 py-2">{d.vendor || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[240px]">
                      <div className="whitespace-pre-wrap break-words">
                        {d.remark || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      <div>{formatTHB(Number(d.reservedTHB))}</div>
                      <div className="text-muted-foreground">
                        {formatUSD(Number(d.reservedUSD))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      <div>{formatTHB(Number(d.actualTHB))}</div>
                      <div className="text-muted-foreground">
                        {formatUSD(Number(d.actualUSD))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      <div>{formatTHB(Number(d.totalSpentTHB))}</div>
                      <div className="text-muted-foreground">
                        {formatUSD(Number(d.totalSpentUSD))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                      {Number(d.rate) ? Number(d.rate).toFixed(4) : "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {d.creator || "—"}
                    </td>
                  </tr>
                ))}
                {selectedMatches.length === 0 && (
                  <tr>
                    <td
                      colSpan={14}
                      className="px-3 py-6 text-center text-muted-foreground"
                    >
                      No detail entries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
