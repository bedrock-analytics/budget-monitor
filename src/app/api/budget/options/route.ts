import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/purchase-request";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const budgets = await db.budget.findMany({
      orderBy: [{ projectTypeName: "asc" }, { budgetItemName: "asc" }],
      select: {
        id: true,
        projectType: true,
        projectTypeName: true,
        budgetItemName: true,
        year: true,
        availableTHB: true,
        availableUSD: true,
      },
    });

    const options = budgets.map((b: any) => ({
      ...b,
      availableTHB: toNumber(b.availableTHB),
      availableUSD: toNumber(b.availableUSD),
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error("Failed to fetch budget options:", error);
    return NextResponse.json({ error: "Failed to fetch budget options" }, { status: 500 });
  }
}
