import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { parseBudgetDetailCSV } from "@/lib/budget-detail";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectCode = searchParams.get("projectCode");
    const data = await db.budgetDetail.findMany({
      where: projectCode ? { projectCode: { contains: projectCode } } : undefined,
      orderBy: [{ projectType: "asc" }, { date: "desc" }],
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load budget detail:", error);
    return NextResponse.json({ error: "Failed to load budget detail" }, { status: 500 });
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
    const rows = parseBudgetDetailCSV(content);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 });
    }

    await db.budgetDetail.deleteMany();

    await db.budgetDetail.createMany({
      data: rows.map((r) => ({
        projectType: r.projectType,
        projectCode: r.projectCode,
        budgetCategory: r.budgetCategory,
        budgetItemName: r.budgetItemName,
        system: r.system,
        type: r.type,
        no: r.no,
        acctCode: r.acctCode,
        accountName: r.accountName,
        date: r.date,
        vendor: r.vendor,
        remark: r.remark,
        reservedTHB: r.reservedTHB,
        actualTHB: r.actualTHB,
        totalSpentTHB: r.totalSpentTHB,
        rate: r.rate,
        reservedUSD: r.reservedUSD,
        actualUSD: r.actualUSD,
        totalSpentUSD: r.totalSpentUSD,
        creator: r.creator,
      })),
    });

    return NextResponse.json({ imported: rows.length });
  } catch (error) {
    console.error("Failed to import budget detail CSV:", error);
    return NextResponse.json({ error: "Failed to import budget detail data" }, { status: 500 });
  }
}
