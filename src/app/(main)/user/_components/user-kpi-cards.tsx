"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ActivitySummary } from "../types";

interface Props {
  summary: ActivitySummary;
}

export function UserKpiCards({ summary }: Props) {
  const pct = (n: number) => (summary.totalUsers > 0 ? ((n / summary.totalUsers) * 100).toFixed(1) : "0.0");

  const cards = [
    {
      title: "Total Users",
      value: summary.totalUsers.toLocaleString(),
      sub: "Registered accounts",
    },
    {
      title: "Active Today",
      value: summary.dau.toLocaleString(),
      sub: `${pct(summary.dau)}% of users`,
    },
    {
      title: "Active This Week",
      value: summary.wau.toLocaleString(),
      sub: `${pct(summary.wau)}% of users (7d)`,
    },
    {
      title: "Active This Month",
      value: summary.mau.toLocaleString(),
      sub: `${pct(summary.mau)}% of users (30d)`,
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
            <div className="font-bold text-2xl tabular-nums">{card.value}</div>
            <p className="mt-1 text-muted-foreground text-xs">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
