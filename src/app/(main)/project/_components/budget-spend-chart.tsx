"use client";

import { useEffect, useMemo, useState } from "react";

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatUSD } from "@/lib/utils";

interface BudgetDetailRecord {
  date: string | null;
  totalSpentUSD: string | number;
}

interface Props {
  projectCode: string;
}

const chartConfig = {
  daily: {
    label: "Daily spend",
    color: "var(--chart-2)",
  },
  cumulative: {
    label: "Cumulative spend",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function BudgetSpendChart({ projectCode }: Props) {
  const [rows, setRows] = useState<BudgetDetailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/budget-detail?projectCode=${encodeURIComponent(projectCode)}`);
        if (!res.ok) throw new Error("Failed to load budget detail");
        const data = (await res.json()) as BudgetDetailRecord[];
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectCode]);

  const data = useMemo(() => {
    const dayTotals = new Map<string, number>();
    for (const r of rows) {
      if (!r.date) continue;
      const day = r.date.slice(0, 10);
      const usd = Number(r.totalSpentUSD);
      if (!Number.isFinite(usd) || usd === 0) continue;
      dayTotals.set(day, (dayTotals.get(day) ?? 0) + usd);
    }
    const sorted = Array.from(dayTotals.entries()).sort(([a], [b]) => a.localeCompare(b));
    let cumulative = 0;
    return sorted.map(([date, daily]) => {
      cumulative += daily;
      return { date, daily, cumulative };
    });
  }, [rows]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actual Spend</CardTitle>
        <CardDescription>
          Daily total spent (bars) and cumulative spend (line) in USD
          {loading && " · loading..."}
          {error && ` · ${error}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">
            {loading ? "Loading..." : "No spend data with dates available."}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <ComposedChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
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
                    labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
                    formatter={(value, name) => [
                      formatUSD(value as number),
                      chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                    ]}
                  />
                }
              />
              <Bar yAxisId="daily" dataKey="daily" fill="var(--color-daily)" radius={[2, 2, 0, 0]} />
              <Line
                yAxisId="cumulative"
                dataKey="cumulative"
                type="monotone"
                stroke="var(--color-cumulative)"
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
