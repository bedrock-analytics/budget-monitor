"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUSD } from "@/lib/utils";

interface Props {
  budgetUSD: number;
  estimateUSD: number;
  actualUSD: number;
}

export function CostKpiCards({ budgetUSD, estimateUSD, actualUSD }: Props) {
  const variance = estimateUSD - actualUSD;
  const utilizationPct = estimateUSD > 0 ? (actualUSD / estimateUSD) * 100 : 0;
  const isOverBudget = variance < 0 && estimateUSD > 0;
  const margin = budgetUSD - estimateUSD;
  const marginPct = budgetUSD > 0 ? (margin / budgetUSD) * 100 : 0;
  const isNegativeMargin = margin < 0 && budgetUSD > 0;

  const cards = [
    {
      title: "Revenue",
      value: formatUSD(budgetUSD),
      sub: "Total project budget (USD)",
      tone: "default" as const,
    },
    {
      title: "Estimate Cost",
      value: formatUSD(estimateUSD),
      sub: "Total project estimate (USD)",
      tone: "default" as const,
    },
    {
      title: "Margin",
      value: formatUSD(margin),
      sub: budgetUSD > 0 ? `${marginPct.toFixed(1)}% of budget` : "No budget set",
      tone: isNegativeMargin ? "danger" : ("good" as const),
    },
    {
      title: "Actual Cost",
      value: formatUSD(actualUSD),
      sub: `${utilizationPct.toFixed(1)}% of estimate`,
      tone: "default" as const,
    },
    {
      title: "Available",
      value: formatUSD(variance),
      sub: variance >= 0 ? "Under budget" : "Over budget",
      tone: isOverBudget ? "danger" : ("good" as const),
    },
    {
      title: "% Spent",
      value: `${utilizationPct.toFixed(1)}%`,
      sub: estimateUSD > 0 ? "Spend progress" : "No estimate set",
      tone: utilizationPct > 100 ? "danger" : ("default" as const),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title} data-slot="card">
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`font-bold text-2xl tabular-nums ${
                card.tone === "danger" ? "text-destructive" : card.tone === "good" ? "text-green-600" : ""
              }`}
            >
              {card.value}
            </div>
            <p className="mt-1 text-muted-foreground text-xs">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
