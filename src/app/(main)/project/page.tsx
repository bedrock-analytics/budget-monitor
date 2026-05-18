"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useSession } from "next-auth/react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ActivitiesTable } from "./_components/activities-table";
import { CostCategoryChart } from "./_components/cost-category-chart";
import { CostKpiCards } from "./_components/cost-kpi-cards";
import { CostTrackingUploadButton } from "./_components/cost-tracking-upload-button";
import { SCurveChart } from "./_components/s-curve-chart";
import type { ProjectDetail, ProjectListItem } from "./_components/types";

export default function ProjectPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cost-tracking");
      if (!res.ok) throw new Error("Failed to load projects");
      const data: ProjectListItem[] = await res.json();
      setProjects(data);
      if (data.length > 0) {
        setSelectedCode((prev) => (prev && data.some((p) => p.projectCode === prev) ? prev : data[0].projectCode));
      } else {
        setSelectedCode("");
        setDetail(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!selectedCode) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cost-tracking/${encodeURIComponent(selectedCode)}`);
        if (!res.ok) throw new Error("Failed to load project detail");
        const data: ProjectDetail = await res.json();
        if (!cancelled) setDetail(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCode]);

  const canUpload = useMemo(() => {
    const email = session?.user?.email?.toLowerCase();
    return email === "thanabutc@rovula.com" || email === "nuttapongsa@rovula.com";
  }, [session]);

  const estimateUSD = detail ? Number(detail.estimateUSD) : 0;
  const actualUSD = detail ? Number(detail.actualChargeUSD) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-2xl">Project Cost Monitor</h1>
          {detail && (
            <p className="mt-1 text-muted-foreground text-sm">
              {detail.projectName} · {detail.projectCode}
              {detail.startDate && detail.endDate && (
                <>
                  {" · "}
                  {new Date(detail.startDate).toLocaleDateString()} – {new Date(detail.endDate).toLocaleDateString()}
                </>
              )}
            </p>
          )}
        </div>
        {canUpload && <CostTrackingUploadButton onSuccess={fetchProjects} />}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedCode} onValueChange={setSelectedCode} disabled={listLoading || projects.length === 0}>
          <SelectTrigger className="w-[360px]">
            <SelectValue placeholder={listLoading ? "Loading projects..." : "Select a project"} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.projectCode}>
                {p.projectName} <span className="text-muted-foreground">({p.projectCode})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {detailLoading && <span className="text-muted-foreground text-sm">Loading project...</span>}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {!listLoading && projects.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="font-medium">No projects yet</p>
          <p className="mt-1 text-muted-foreground text-sm">
            {canUpload
              ? "Upload a cost-tracking CSV to get started."
              : "Ask an administrator to upload a cost-tracking CSV."}
          </p>
        </div>
      )}

      {detail && (
        <>
          <CostKpiCards estimateUSD={estimateUSD} actualUSD={actualUSD} />
          <ActivitiesTable activities={detail.activities} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CostCategoryChart activities={detail.activities} />
            <SCurveChart activities={detail.activities} />
          </div>
        </>
      )}
    </div>
  );
}
