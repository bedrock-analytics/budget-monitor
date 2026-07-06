import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { hasRole, requireRole } from "@/lib/authz";
import { aggregateBudgetData, applyBudgetImport, parseCSVContent, validateBudgetRows } from "@/lib/budget";
import { db } from "@/lib/db";
import { checkRowCount, parseImportMode, validateImportFile } from "@/lib/import-validation";
import { rateLimitResponse } from "@/lib/rate-limit";

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
    const auth = await requireRole("MANAGER");
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const limited = rateLimitResponse(`import:${user.id}`, 10, 60_000);
    if (limited) return limited;

    const url = new URL(request.url);
    const mode = parseImportMode(url.searchParams.get("mode"));
    const dryRun = url.searchParams.get("dryRun") === "1";

    if (mode === "replace" && !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Replace mode requires ADMIN" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileError = validateImportFile(file, [".csv"]);
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });

    const content = await file.text();
    const rows = parseCSVContent(content);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 });
    }

    const rowCountError = checkRowCount(rows.length);
    if (rowCountError) return NextResponse.json({ error: rowCountError }, { status: 400 });

    const errors = validateBudgetRows(rows);

    if (dryRun) {
      const currentCount = await db.budget.count();
      return NextResponse.json({ dryRun: true, mode, rowCount: rows.length, currentCount, errors });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const { affected } = await applyBudgetImport(rows, mode, user.id, "budget.import", file.name);

    return NextResponse.json({ imported: affected, mode });
  } catch (error) {
    console.error("Failed to import budget CSV:", error);
    return NextResponse.json({ error: "Failed to import budget data" }, { status: 500 });
  }
}
