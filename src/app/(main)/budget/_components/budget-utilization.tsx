"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectSummary } from "@/lib/budget";
import { formatTHB } from "@/lib/utils";

interface Props {
  byProject: ProjectSummary[];
}

export function BudgetUtilization({ byProject }: Props) {
  const sorted = [...byProject].sort((a, b) => b.budgetTHB - a.budgetTHB);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Utilization</CardTitle>
        <CardDescription>Actual spend vs. approved budget per project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.map((project) => {
          const utilizationPct =
            project.budgetTHB > 0 ? Math.min((project.actualTHB / project.budgetTHB) * 100, 100) : 0;
          const isOverBudget = project.actualTHB > project.budgetTHB && project.budgetTHB > 0;

          return (
            <div key={project.projectType} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{project.projectName}</span>
                  <span className="ml-2 text-muted-foreground text-xs">{project.projectType}</span>
                </div>
                <span
                  className={`shrink-0 text-xs tabular-nums ${isOverBudget ? "font-semibold text-destructive" : "text-muted-foreground"}`}
                >
                  {project.budgetTHB > 0 ? `${((project.actualTHB / project.budgetTHB) * 100).toFixed(0)}%` : "—"}
                </span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${isOverBudget ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${utilizationPct}%` }}
                />
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Actual: {formatTHB(project.actualTHB)}</span>
                <span>Budget: {formatTHB(project.budgetTHB)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
