"use client";

import { use, useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

import { ActivitiesTable } from "../_components/activities-table";
import { BudgetSpendChart } from "../_components/budget-spend-chart";
import { CostCategoryChart } from "../_components/cost-category-chart";
import { CostKpiCards } from "../_components/cost-kpi-cards";
import { CostTrackingUploadButton } from "../_components/cost-tracking-upload-button";
import { ProjectBudgetDetailTable } from "../_components/project-budget-detail-table";
import { SCurveChart } from "../_components/s-curve-chart";
import type { ProjectDetail } from "../_components/types";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { code } = use(params);
  const { data: session } = useSession();
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cost-tracking/${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error("Failed to load project detail");
      const data: ProjectDetail = await res.json();
      setDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const email = session?.user?.email?.toLowerCase();
  const canUpload = email === "thanabutc@rovula.com" || email === "nuttapongsa@rovula.com";

  const budgetUSD = detail ? Number(detail.budgetUSD) : 0;
  const estimateUSD = detail ? Number(detail.estimateUSD) : 0;
  const actualUSD = detail ? Number(detail.actualChargeUSD) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
            <Link href="/project">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to projects
            </Link>
          </Button>
          <h1 className="font-bold text-2xl">{detail?.projectName ?? "Project"}</h1>
          {detail && (
            <p className="text-muted-foreground text-sm">
              {detail.projectCode}
              {detail.startDate && detail.endDate && (
                <>
                  {" · "}
                  {new Date(detail.startDate).toLocaleDateString()} – {new Date(detail.endDate).toLocaleDateString()}
                </>
              )}
            </p>
          )}
        </div>
        {canUpload && <CostTrackingUploadButton onSuccess={fetchDetail} />}
      </div>

      {loading && <p className="text-muted-foreground text-sm">Loading project...</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {detail && (
        <>
          <CostKpiCards budgetUSD={budgetUSD} estimateUSD={estimateUSD} actualUSD={actualUSD} />
          <ActivitiesTable activities={detail.activities} />
          <ProjectBudgetDetailTable projectCode={detail.projectCode} />
          <BudgetSpendChart projectCode={detail.projectCode} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CostCategoryChart activities={detail.activities} />
            <SCurveChart activities={detail.activities} startDate={detail.startDate} endDate={detail.endDate} />
          </div>
        </>
      )}
    </div>
  );
}
