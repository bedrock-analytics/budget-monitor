"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BudgetSummary } from "@/lib/budget";

interface Props {
  summary: BudgetSummary;
}

export function BudgetKpiCards({ summary }: Props) {
  const formatTHB = (value: number): string => {
    return value.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  };

  const formatUSD = (value: number): string => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const utilizationPct =
    summary.totalBudgetTHB > 0 ? ((summary.totalActualTHB / summary.totalBudgetTHB) * 100).toFixed(1) : "0.0";

  const reservedPct =
    summary.totalBudgetTHB > 0 ? ((summary.totalReservedTHB / summary.totalBudgetTHB) * 100).toFixed(1) : "0.0";

  const cards = [
    {
      title: "Total Budget",
      valueTHB: formatTHB(summary.totalBudgetTHB),
      valueUSD: formatUSD(summary.totalBudgetUSD),
      sub: "Approved budget (THB)",
    },
    {
      title: "Reserved",
      valueTHB: formatTHB(summary.totalReservedTHB),
      valueUSD: formatUSD(summary.totalReservedUSD),
      sub: `${reservedPct}% of budget committed`,
    },
    {
      title: "Actual Spent",
      valueTHB: formatTHB(summary.totalActualTHB),
      valueUSD: formatUSD(summary.totalActualUSD),
      sub: `${utilizationPct}% budget utilized`,
    },
    {
      title: "Available",
      valueTHB: formatTHB(summary.totalAvailableTHB),
      valueUSD: formatUSD(summary.totalAvailableUSD),
      sub: "Remaining balance",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} data-slot="card">
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl tabular-nums">{card.valueTHB}</div>
            <div className="text-xl tabular-nums">{card.valueUSD}</div>
            <p className="mt-1 text-muted-foreground text-xs">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
