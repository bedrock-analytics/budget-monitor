"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
// import { formatTHB } from "@/lib/budget";
import type { ProjectSummary } from "@/lib/budget";

interface Props {
  byProject: ProjectSummary[];
}

const chartConfig = {
  budgetTHB: {
    label: "Budget",
    color: "var(--chart-1)",
  },
  reservedTHB: {
    label: "Reserved",
    color: "var(--chart-2)",
  },
  actualTHB: {
    label: "Actual",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function BudgetProjectChart({ byProject }: Props) {
  const data = byProject.map((p) => ({
    name: p.projectName,
    budgetTHB: p.budgetTHB,
    reservedTHB: p.reservedTHB,
    actualTHB: p.actualTHB,
  }));

  const formatTHB = (value: number): string => {
    return value.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget by Project</CardTitle>
        <CardDescription>
          Budget, Reserved and Actual spending per project (THB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => formatTHB(v)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    formatTHB(value as number),
                    chartConfig[name as keyof typeof chartConfig]?.label ??
                      name,
                  ]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="budgetTHB"
              fill="var(--color-budgetTHB)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="reservedTHB"
              fill="var(--color-reservedTHB)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actualTHB"
              fill="var(--color-actualTHB)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
