"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatTHB, formatUSD } from "@/lib/utils";
import type { BudgetRow } from "@/lib/budget";

interface Props {
  rows: BudgetRow[];
}

export function BudgetDetailTable({ rows }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Line Items</CardTitle>
        <CardDescription>{rows.length} active budget entries</CardDescription>
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
    </Card>
  );
}
