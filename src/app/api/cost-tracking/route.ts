import { NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";

import { parseCostTrackingCSV } from "@/lib/cost-tracking";
import { db } from "@/lib/db";

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

    const content = await file.text();
    const parsed = parseCostTrackingCSV(content);

    if (!parsed.projectCode) {
      return NextResponse.json({ error: "Could not detect project code from CSV header" }, { status: 400 });
    }
    if (parsed.activities.length === 0) {
      return NextResponse.json({ error: "No activity rows found in CSV" }, { status: 400 });
    }

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
      },
      update: {
        projectName: parsed.projectName,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        actualChargeUSD: parsed.actualChargeUSD,
        estimateUSD: parsed.estimateUSD,
        exchangeRates: parsed.exchangeRates,
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
    });
  } catch (error) {
    console.error("Failed to import cost tracking CSV:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to import CSV: ${message}` }, { status: 500 });
  }
}
