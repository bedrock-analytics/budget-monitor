import { applyBudgetImport, type BudgetRow, parseCSVContent, validateBudgetRows } from "@/lib/budget";
import type { DatasetProvider } from "@/lib/data-registry/types";
import { db } from "@/lib/db";
import { checkRowCount } from "@/lib/import-validation";

export const budgetProvider: DatasetProvider = {
  key: "budget",
  label: "Budget",
  description: "Aggregate project budget rows (THB/USD) by project type and budget item.",
  minRole: "MANAGER",
  accepts: ["csv"],
  supportsReplace: true,

  async count() {
    return db.budget.count();
  },

  async sample(limit) {
    return db.budget.findMany({ take: limit, orderBy: { updatedAt: "desc" } });
  },

  async parse(file) {
    const content = await file.text();
    const rows = parseCSVContent(content);
    if (rows.length === 0) return { rows: [], errors: ["No data rows found in CSV"] };

    const rowCountError = checkRowCount(rows.length);
    if (rowCountError) return { rows: [], errors: [rowCountError] };

    return { rows, errors: validateBudgetRows(rows) };
  },

  async apply(rows, mode, actorId, filename) {
    return applyBudgetImport(rows as BudgetRow[], mode, actorId, "data.import", filename);
  },

  async clear(actorId) {
    return db.$transaction(async (tx) => {
      const { count } = await tx.budget.deleteMany();
      await tx.auditLog.create({
        data: { actorId, action: "data.clear", target: "budget", metadata: { affected: count } },
      });
      return { affected: count };
    });
  },
};
