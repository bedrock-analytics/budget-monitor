"use client";

import { useMemo } from "react";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatUSD } from "@/lib/utils";

import type { ActivityRecord } from "./types";

interface Props {
  activities: ActivityRecord[];
  startDate: string | null;
  endDate: string | null;
}

const chartConfig = {
  daily: {
    label: "Daily planned",
    color: "var(--chart-2)",
  },
  estimate: {
    label: "Cumulative planned",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function SCurveChart({ activities, startDate, endDate }: Props) {
  const data = useMemo(() => {
    const start = startDate
      ? new Date(startDate).toISOString().slice(0, 10)
      : null;
    const end = endDate ? new Date(endDate).toISOString().slice(0, 10) : null;
    console.log("start ", start);
    console.log("end ", end);
    const dayTotals = new Map<string, number>();
    for (const a of activities) {
      const tracking = Number(a.trackingAmount);
      const sumUSD = Number(a.sumPOUSD);
      if (tracking <= 0 || sumUSD <= 0) continue;
      const perUnitUSD = sumUSD / tracking;
      for (const dv of a.dailyValues ?? []) {
        if (start && dv.date < start) continue;
        if (end && dv.date > end) continue;
        const usd = Number(dv.value) * perUnitUSD;
        dayTotals.set(dv.date, (dayTotals.get(dv.date) ?? 0) + usd);
      }
    }
    const sorted = Array.from(dayTotals.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    let cumulative = 0;
    console.log("activities ", activities);
    return sorted.map(([date, daily]) => {
      cumulative += daily;
      return { date, daily, estimate: cumulative };
    });
  }, [activities, startDate, endDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planned Spend (S-Curve)</CardTitle>
        <CardDescription>
          Daily planned cost (bars) and cumulative planned cost (line) in USD
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">
            No daily allocation data available.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <ComposedChart
              data={data}
              margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
            >
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
                yAxisId="daily"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatUSD(v as number)}
                width={80}
              />
              <YAxis
                yAxisId="cumulative"
                orientation="right"
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
                    labelFormatter={(label) =>
                      new Date(label as string).toLocaleDateString()
                    }
                    formatter={(value, name) => [
                      formatUSD(value as number),
                      chartConfig[name as keyof typeof chartConfig]?.label ??
                        name,
                    ]}
                  />
                }
              />
              <Bar
                yAxisId="daily"
                dataKey="daily"
                fill="var(--color-daily)"
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="cumulative"
                dataKey="estimate"
                type="monotone"
                stroke="var(--color-estimate)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
