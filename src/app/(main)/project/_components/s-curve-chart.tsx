"use client";

import { useMemo } from "react";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatUSD } from "@/lib/utils";

import type { ActivityRecord } from "./types";

interface Props {
  activities: ActivityRecord[];
}

const chartConfig = {
  estimate: {
    label: "Estimated cumulative",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function SCurveChart({ activities }: Props) {
  const data = useMemo(() => {
    const dayTotals = new Map<string, number>();
    for (const a of activities) {
      const tracking = Number(a.trackingAmount);
      const sumUSD = Number(a.sumPOUSD);
      if (tracking <= 0 || sumUSD <= 0) continue;
      const perUnitUSD = sumUSD / tracking;
      for (const dv of a.dailyValues ?? []) {
        const usd = Number(dv.value) * perUnitUSD;
        dayTotals.set(dv.date, (dayTotals.get(dv.date) ?? 0) + usd);
      }
    }
    const sorted = Array.from(dayTotals.entries()).sort(([a], [b]) => a.localeCompare(b));
    let cumulative = 0;
    return sorted.map(([date, daily]) => {
      cumulative += daily;
      return { date, daily, estimate: cumulative };
    });
  }, [activities]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Spend (S-Curve)</CardTitle>
        <CardDescription>Estimated cumulative cost over the project timeline (USD)</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">No daily allocation data available.</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  new Date(v as string).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatUSD(v as number)}
                width={80}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
                    formatter={(value, name) => [
                      formatUSD(value as number),
                      chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                    ]}
                  />
                }
              />
              <defs>
                <linearGradient id="fillEstimate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-estimate)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-estimate)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                dataKey="estimate"
                type="monotone"
                stroke="var(--color-estimate)"
                fill="url(#fillEstimate)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
