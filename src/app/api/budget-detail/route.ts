import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { hasRole, requireRole } from "@/lib/authz";
import { parseBudgetDetailCSV, validateBudgetDetailRows } from "@/lib/budget-detail";
import { db } from "@/lib/db";
import { checkRowCount, parseImportMode, validateImportFile } from "@/lib/import-validation";

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
    const auth = await requireRole("MANAGER");
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

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
    const rows = parseBudgetDetailCSV(content);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 });
    }

    const rowCountError = checkRowCount(rows.length);
    if (rowCountError) return NextResponse.json({ error: rowCountError }, { status: 400 });

    const errors = validateBudgetDetailRows(rows);

    if (dryRun) {
      return NextResponse.json({ dryRun: true, mode, rowCount: rows.length, errors });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const imported = await db.$transaction(async (tx) => {
      if (mode === "replace") {
        await tx.budgetDetail.deleteMany();
      }

      await tx.budgetDetail.createMany({
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

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "budget-detail.import",
          target: "budget-detail",
          metadata: { mode, filename: file.name, imported: rows.length },
        },
      });

      return rows.length;
    });

    return NextResponse.json({ imported, mode });
  } catch (error) {
    console.error("Failed to import budget detail CSV:", error);
    return NextResponse.json({ error: "Failed to import budget detail data" }, { status: 500 });
  }
}
