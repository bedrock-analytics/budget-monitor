"use client";

import { useMemo } from "react";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatUSD } from "@/lib/utils";

import type { ActivityRecord } from "./types";

interface Props {
  activities: ActivityRecord[];
}

const chartConfig = {
  estimate: {
    label: "Estimate",
    color: "var(--chart-1)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function CostCategoryChart({ activities }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, { estimate: number; actual: number }>();
    for (const a of activities) {
      const key = a.itemCode || "Unspecified";
      let bucket = map.get(key);
      if (!bucket) {
        bucket = { estimate: 0, actual: 0 };
        map.set(key, bucket);
      }
      bucket.estimate += Number(a.sumPOUSD);
      bucket.actual += Number(a.invoiceUSD);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .filter((r) => r.estimate > 0 || r.actual > 0)
      .sort((a, b) => b.estimate - a.estimate);
  }, [activities]);

  const chartHeight = Math.max(280, data.length * 32);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost by Category</CardTitle>
        <CardDescription>Estimate vs actual grouped by item code (USD)</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">No category data available.</p>
        ) : (
          <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid horizontal={true} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                width={200}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatUSD(v as number)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      formatUSD(value as number),
                      chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                    ]}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="estimate" fill="var(--color-estimate)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="actual" fill="var(--color-actual)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
