import { NextResponse } from "next/server";

import type { Prisma, User } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { requireRole } from "@/lib/authz";
import {
  applyCostTrackingImport,
  extractSheets,
  isBudgetSummaryCSV,
  isExcelFile,
  type ParsedBudgetSummary,
  type ParsedCostTracking,
  parseBudgetSummaryCSV,
  parseCostTrackingCSV,
  validateCostTrackingActivities,
} from "@/lib/cost-tracking";
import { db } from "@/lib/db";
import { checkRowCount, validateImportFile } from "@/lib/import-validation";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projects = await db.costTrackingProject.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        projectCode: true,
        projectName: true,
        startDate: true,
        endDate: true,
        actualChargeUSD: true,
        estimateUSD: true,
        budgetUSD: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to load cost tracking projects:", error);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireRole("MANAGER");
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const url = new URL(request.url);
    const dryRun = url.searchParams.get("dryRun") === "1";

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileObj = file as File;

    const fileError = validateImportFile(fileObj, [".csv", ".xlsx", ".xls"]);
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });

    if (!isExcelFile(fileObj)) {
      const text = await fileObj.text();
      if (isBudgetSummaryCSV(text)) {
        return await applyBudgetSummaryOnly(parseBudgetSummaryCSV(text), user, dryRun);
      }
    }

    let activitiesCSV: string;
    let budgetCSV: string | null;
    let parsed: ParsedCostTracking;
    try {
      ({ activitiesCSV, budgetCSV } = await extractSheets(fileObj));
      parsed = parseCostTrackingCSV(activitiesCSV);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid file";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!parsed.projectCode) {
      return NextResponse.json({ error: "Could not detect project code from CSV header" }, { status: 400 });
    }
    if (parsed.activities.length === 0) {
      return NextResponse.json({ error: "No activity rows found in CSV" }, { status: 400 });
    }

    const rowCountError = checkRowCount(parsed.activities.length);
    if (rowCountError) return NextResponse.json({ error: rowCountError }, { status: 400 });

    const errors = validateCostTrackingActivities(parsed.activities);

    const summary = budgetCSV ? parseBudgetSummaryCSV(budgetCSV) : null;
    const budgetUSD = summary?.projectRevenue && summary.projectRevenue > 0 ? summary.projectRevenue : undefined;
    const budgetByItemCode = summary?.budgetByItemCode ?? {};

    if (dryRun) {
      const existingProject = await db.costTrackingProject.findUnique({ where: { projectCode: parsed.projectCode } });
      const currentActivityCount = existingProject
        ? await db.costTrackingActivity.count({ where: { projectId: existingProject.id } })
        : 0;
      return NextResponse.json({
        dryRun: true,
        projectCode: parsed.projectCode,
        projectName: parsed.projectName,
        rowCount: parsed.activities.length,
        currentActivityCount,
        isNewProject: !existingProject,
        errors,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const { affected, project } = await applyCostTrackingImport(
      parsed,
      budgetUSD,
      budgetByItemCode,
      summary !== null,
      user.id,
      "cost-tracking.import",
      fileObj.name,
    );

    return NextResponse.json({
      projectCode: project.projectCode,
      projectName: project.projectName,
      activities: affected,
      budgetUSD: budgetUSD ?? null,
      budgetItems: Object.keys(budgetByItemCode).length,
    });
  } catch (error) {
    console.error("Failed to import cost tracking CSV:", error);
    return NextResponse.json({ error: "Failed to import cost tracking data" }, { status: 500 });
  }
}

async function applyBudgetSummaryOnly(summary: ParsedBudgetSummary, user: User, dryRun: boolean) {
  if (!summary.projectCode) {
    return NextResponse.json({ error: "Budget CSV is missing Project Code" }, { status: 400 });
  }
  const existing = await db.costTrackingProject.findUnique({ where: { projectCode: summary.projectCode } });
  if (!existing) {
    return NextResponse.json(
      { error: `Project ${summary.projectCode} not found. Import the activities sheet first.` },
      { status: 400 },
    );
  }

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      projectCode: summary.projectCode,
      budgetUSD: summary.projectRevenue,
      budgetItems: Object.keys(summary.budgetByItemCode).length,
      errors: [],
    });
  }

  await db.$transaction(async (tx) => {
    await tx.costTrackingProject.update({
      where: { projectCode: summary.projectCode },
      data: {
        ...(summary.projectRevenue > 0 ? { budgetUSD: summary.projectRevenue } : {}),
        budgetByItemCode: summary.budgetByItemCode as Prisma.InputJsonValue,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "cost-tracking.import",
        target: "cost-tracking",
        metadata: { projectCode: summary.projectCode, budgetOnly: true },
      },
    });
  });

  return NextResponse.json({
    projectCode: summary.projectCode,
    activities: 0,
    budgetUSD: summary.projectRevenue,
    budgetItems: Object.keys(summary.budgetByItemCode).length,
  });
}
