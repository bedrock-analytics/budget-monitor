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
          const budgetPct = (item.budgetTHB / maxBudget) * 100;
          const actualPct =
            item.budgetTHB > 0
              ? Math.min((item.actualTHB / item.budgetTHB) * 100, 100)
              : 0;
          const alpha = Math.max(0.4, 1 - index * 0.05);

          return (
            <div key={item.budgetItemName} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span
                  className="truncate font-medium"
                  title={item.budgetItemName}
                >
                  {item.budgetItemName}
                </span>
                <span className="ml-4 shrink-0 text-muted-foreground tabular-nums">
                  {formatTHB(item.actualTHB)} / {formatTHB(item.budgetTHB)}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${budgetPct}%`,
                    background: `color-mix(in oklch, var(--primary) ${alpha * 60}%, transparent)`,
                  }}
                />
                {item.actualTHB > 0 && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${(actualPct / 100) * budgetPct}%`,
                      background: `color-mix(in oklch, var(--primary) ${alpha * 100}%, transparent)`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
