"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import type { ActivitySummary } from "../types";

interface Props {
  daily: ActivitySummary["daily"];
}

const chartConfig = {
  count: {
    label: "Active Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function UserActivityChart({ daily }: Props) {
  const data = daily.map((d) => ({
    date: d.date,
    count: d.count,
    label: new Date(`${d.date}T00:00:00.000Z`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Active Users</CardTitle>
        <CardDescription>Distinct users active per day (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
