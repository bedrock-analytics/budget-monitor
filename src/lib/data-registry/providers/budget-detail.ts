import {
  applyBudgetDetailImport,
  type BudgetDetailRow,
  parseBudgetDetailCSV,
  validateBudgetDetailRows,
} from "@/lib/budget-detail";
import type { DatasetProvider } from "@/lib/data-registry/types";
import { db } from "@/lib/db";
import { checkRowCount } from "@/lib/import-validation";

export const budgetDetailProvider: DatasetProvider = {
  key: "budget-detail",
  label: "Budget Detail",
  description: "Line-item PO/PR/DraftPR spend detail per project code.",
  minRole: "MANAGER",
  accepts: ["csv"],
  supportsReplace: true,

  async count() {
    return db.budgetDetail.count();
  },

  async sample(limit) {
    return db.budgetDetail.findMany({ take: limit, orderBy: [{ projectType: "asc" }, { date: "desc" }] });
  },

  async parse(file) {
    const content = await file.text();
    const rows = parseBudgetDetailCSV(content);
    if (rows.length === 0) return { rows: [], errors: ["No data rows found in CSV"] };

    const rowCountError = checkRowCount(rows.length);
    if (rowCountError) return { rows: [], errors: [rowCountError] };

    return { rows, errors: validateBudgetDetailRows(rows) };
  },

  async apply(rows, mode, actorId, filename) {
    return applyBudgetDetailImport(rows as BudgetDetailRow[], mode, actorId, "data.import", filename);
  },

  async clear(actorId) {
    return db.$transaction(async (tx) => {
      const { count } = await tx.budgetDetail.deleteMany();
      await tx.auditLog.create({
        data: { actorId, action: "data.clear", target: "budget-detail", metadata: { affected: count } },
      });
      return { affected: count };
    });
  },
};
