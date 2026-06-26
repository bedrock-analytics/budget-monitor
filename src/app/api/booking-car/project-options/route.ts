import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  try {
    const budgets = await db.budget.findMany({
      select: { projectType: true, projectTypeName: true },
      distinct: ["projectType"],
      orderBy: { projectTypeName: "asc" },
    });

    const options = budgets.map((b) => ({
      code: b.projectType,
      name: b.projectTypeName,
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error("Failed to fetch project options:", error);
    return NextResponse.json({ error: "Failed to fetch project options" }, { status: 500 });
  }
}
