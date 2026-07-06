import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { aggregateBudgetData, parseCSVContent } from "@/lib/budget";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await db.budget.findMany({
      where: user?.canSeeStaffBenefit
        ? undefined
        : {
            NOT: [
              {
                budgetItemName: {
                  contains: "staff benefit",
                  mode: "insensitive",
                },
              },
              {
                budgetItemName: {
                  contains: "staff expense",
                  mode: "insensitive",
                },
              },
            ],
          },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        projectType: true,
        projectTypeName: true,
        budgetItemName: true,
        year: true,
        budgetTHB: true,
        reservedTHB: true,
        actualTHB: true,
        availableTHB: true,
        budgetUSD: true,
        reservedUSD: true,
        actualUSD: true,
        availableUSD: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const transform = aggregateBudgetData(data);

    return NextResponse.json(transform);
  } catch (error) {
    console.error("Failed to read budget CSV:", error);
    return NextResponse.json({ error: "Failed to load budget data" }, { status: 500 });
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
    const rows = parseCSVContent(content);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 });
    }
    await db.budget.deleteMany();

    await db.budget.createMany({
      data: rows.map((r) => ({
        projectType: r.projectType,
        projectTypeName: r.projectTypeName,
        budgetItemName: r.budgetItemName,
        year: r.year,
        budgetTHB: r.budgetTHB,
        reservedTHB: r.reservedTHB,
        actualTHB: r.actualTHB,
        availableTHB: r.availableTHB,
        budgetUSD: r.budgetUSD,
        reservedUSD: r.reservedUSD,
        actualUSD: r.actualUSD,
        availableUSD: r.availableUSD,
      })),
    });

    return NextResponse.json({ imported: rows.length });
  } catch (error) {
    console.error("Failed to import budget CSV:", error);
    return NextResponse.json({ error: "Failed to import budget data" }, { status: 500 });
  }
}
