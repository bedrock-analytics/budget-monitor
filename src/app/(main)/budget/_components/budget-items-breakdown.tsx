"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BudgetItemSummary } from "@/lib/budget";

interface Props {
  byBudgetItem: BudgetItemSummary[];
}

export function BudgetItemsBreakdown({ byBudgetItem }: Props) {
  const maxBudget = Math.max(...byBudgetItem.map((i) => i.budgetTHB), 1);

  const formatTHB = (value: number): string => {
    return value.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget by Category</CardTitle>
        <CardDescription>
          Budget and actual spending per expense category (THB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {byBudgetItem.map((item, index) => {
          const utilizationPct =
            item.budgetTHB > 0
              ? Math.min((item.actualTHB / item.budgetTHB) * 100, 100)
              : 0;
          const isOverBudget =
            Number(Math.abs(item.actualTHB)) > item.budgetTHB;

          return (
            <div key={item.budgetItemName} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="truncate font-medium">
                    {item.budgetItemName}
                  </span>
                </div>
                <span
                  className={`shrink-0 tabular-nums text-xs ${isOverBudget ? "text-destructive font-semibold" : "text-muted-foreground"}`}
                >
                  {item.budgetTHB > 0
                    ? `${((item.actualTHB / item.budgetTHB) * 100).toFixed(0)}%`
                    : "—"}
                </span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${isOverBudget ? "bg-destructive" : "bg-primary"}`}
                  // style={{ width: `${utilizationPct}%` }}
                  style={{ width: `${isOverBudget ? "100" : utilizationPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Actual: {formatTHB(item.actualTHB)}</span>
                <span>Budget: {formatTHB(item.budgetTHB)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
