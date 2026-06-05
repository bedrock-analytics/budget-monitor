import { NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";

import {
  isBudgetSummaryCSV,
  type ParsedBudgetSummary,
  parseBudgetSummaryCSV,
  parseCostTrackingCSV,
} from "@/lib/cost-tracking";
import { db } from "@/lib/db";

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return true;
  const type = file.type;
  return (
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || type === "application/vnd.ms-excel"
  );
}

function sheetHasActivitiesAnchor(csv: string): boolean {
  const lines = csv.split(/\r?\n/).slice(0, 30);
  return lines.some((line) => {
    const cols = line.split(",");
    return cols[1]?.replace(/^"|"$/g, "").trim().toLowerCase() === "activities";
  });
}

interface ExtractedSheets {
  activitiesCSV: string;
  budgetCSV: string | null;
}

async function extractSheets(file: File): Promise<ExtractedSheets> {
  if (isExcelFile(file)) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
    if (workbook.SheetNames.length === 0) throw new Error("Excel file has no sheets");

    let activitiesCSV = "";
    let budgetCSV: string | null = null;
    let firstCsv = "";

    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      if (!sheet) continue;
      const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: true });
      if (!firstCsv) firstCsv = csv;
      if (!activitiesCSV && sheetHasActivitiesAnchor(csv)) activitiesCSV = csv;
      else if (!budgetCSV && isBudgetSummaryCSV(csv)) budgetCSV = csv;
    }

    if (!activitiesCSV) activitiesCSV = firstCsv;
    return { activitiesCSV, budgetCSV };
  }
  return { activitiesCSV: await file.text(), budgetCSV: null };
}

export async function GET() {
  try {
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
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileObj = file as File;

    if (!isExcelFile(fileObj)) {
      const text = await fileObj.text();
      if (isBudgetSummaryCSV(text)) {
        return await applyBudgetSummaryOnly(parseBudgetSummaryCSV(text));
      }
    }

    const { activitiesCSV, budgetCSV } = await extractSheets(fileObj);
    const parsed = parseCostTrackingCSV(activitiesCSV);

    if (!parsed.projectCode) {
      return NextResponse.json({ error: "Could not detect project code from CSV header" }, { status: 400 });
    }
    if (parsed.activities.length === 0) {
      return NextResponse.json({ error: "No activity rows found in CSV" }, { status: 400 });
    }

    const summary = budgetCSV ? parseBudgetSummaryCSV(budgetCSV) : null;
    const budgetUSD = summary?.projectRevenue && summary.projectRevenue > 0 ? summary.projectRevenue : undefined;
    const budgetByItemCode = summary?.budgetByItemCode ?? {};

    const project = await db.costTrackingProject.upsert({
      where: { projectCode: parsed.projectCode },
      create: {
        projectCode: parsed.projectCode,
        projectName: parsed.projectName,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        actualChargeUSD: parsed.actualChargeUSD,
        estimateUSD: parsed.estimateUSD,
        exchangeRates: parsed.exchangeRates,
        ...(budgetUSD !== undefined ? { budgetUSD } : {}),
        budgetByItemCode: budgetByItemCode as Prisma.InputJsonValue,
      },
      update: {
        projectName: parsed.projectName,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        actualChargeUSD: parsed.actualChargeUSD,
        estimateUSD: parsed.estimateUSD,
        exchangeRates: parsed.exchangeRates,
        ...(budgetUSD !== undefined ? { budgetUSD } : {}),
        ...(summary ? { budgetByItemCode: budgetByItemCode as Prisma.InputJsonValue } : {}),
      },
    });

    await db.costTrackingActivity.deleteMany({
      where: { projectId: project.id },
    });

    await db.costTrackingActivity.createMany({
      data: parsed.activities.map((a) => ({
        projectId: project.id,
        position: a.position,
        groupName: a.groupName,
        description: a.description,
        itemCode: a.itemCode,
        lumpSum: a.lumpSum,
        rate: a.rate,
        invoiceLocal: a.invoiceLocal,
        invoiceUSD: a.invoiceUSD,
        sumPOLocal: a.sumPOLocal,
        currency: a.currency,
        sumPOUSD: a.sumPOUSD,
        trackingAmount: a.trackingAmount,
        poEstAmount: a.poEstAmount,
        dailyValues: a.dailyValues as unknown as Prisma.InputJsonValue,
      })),
    });

    return NextResponse.json({
      projectCode: project.projectCode,
      projectName: project.projectName,
      activities: parsed.activities.length,
      budgetUSD: budgetUSD ?? null,
      budgetItems: Object.keys(budgetByItemCode).length,
    });
  } catch (error) {
    console.error("Failed to import cost tracking CSV:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to import CSV: ${message}` }, { status: 500 });
  }
}

async function applyBudgetSummaryOnly(summary: ParsedBudgetSummary) {
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
  await db.costTrackingProject.update({
    where: { projectCode: summary.projectCode },
    data: {
      ...(summary.projectRevenue > 0 ? { budgetUSD: summary.projectRevenue } : {}),
      budgetByItemCode: summary.budgetByItemCode as Prisma.InputJsonValue,
    },
  });
  return NextResponse.json({
    projectCode: summary.projectCode,
    activities: 0,
    budgetUSD: summary.projectRevenue,
    budgetItems: Object.keys(summary.budgetByItemCode).length,
  });
}
