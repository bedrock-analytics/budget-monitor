import {
  applyCostTrackingImport,
  type CostTrackingActivityRow,
  extractSheets,
  type ParsedCostTracking,
  parseBudgetSummaryCSV,
  parseCostTrackingCSV,
  validateCostTrackingActivities,
} from "@/lib/cost-tracking";
import type { DatasetProvider } from "@/lib/data-registry/types";
import { db } from "@/lib/db";
import { checkRowCount } from "@/lib/import-validation";

interface CostTrackingMeta {
  projectCode: string;
  projectName: string;
  actualChargeUSD: number;
  estimateUSD: number;
  exchangeRates: Record<string, number>;
  startDate: Date | null;
  endDate: Date | null;
  budgetUSD: number | undefined;
  budgetByItemCode: Record<string, number>;
  hasSummary: boolean;
}

export const costTrackingProvider: DatasetProvider = {
  key: "cost-tracking",
  label: "Cost Tracking",
  description: "Per-project activity ledger; each import fully replaces that project's activities.",
  minRole: "MANAGER",
  accepts: ["csv", "xlsx", "xls"],
  // Every import already replaces the target project's activities by design (there's no
  // "append new activities" mode) -- a global replace-everything toggle isn't a real
  // operation here, that's what clear() is for.
  supportsReplace: false,

  async count() {
    return db.costTrackingProject.count();
  },

  async keys() {
    const projects = await db.costTrackingProject.findMany({
      select: { projectCode: true },
      orderBy: { projectCode: "asc" },
    });
    return projects.map((p) => p.projectCode);
  },

  async sample(limit) {
    return db.costTrackingProject.findMany({ take: limit, orderBy: { updatedAt: "desc" } });
  },

  async parse(file) {
    let activitiesCSV: string;
    let budgetCSV: string | null;
    try {
      ({ activitiesCSV, budgetCSV } = await extractSheets(file));
    } catch (error) {
      return { rows: [], errors: [error instanceof Error ? error.message : "Invalid file"] };
    }

    let parsed: ParsedCostTracking;
    try {
      parsed = parseCostTrackingCSV(activitiesCSV);
    } catch (error) {
      return { rows: [], errors: [error instanceof Error ? error.message : "Invalid file"] };
    }

    if (!parsed.projectCode) return { rows: [], errors: ["Could not detect project code from CSV header"] };
    if (parsed.activities.length === 0) return { rows: [], errors: ["No activity rows found in CSV"] };

    const rowCountError = checkRowCount(parsed.activities.length);
    if (rowCountError) return { rows: [], errors: [rowCountError] };

    const summary = budgetCSV ? parseBudgetSummaryCSV(budgetCSV) : null;
    const budgetUSD = summary?.projectRevenue && summary.projectRevenue > 0 ? summary.projectRevenue : undefined;
    const budgetByItemCode = summary?.budgetByItemCode ?? {};

    const meta: CostTrackingMeta = {
      projectCode: parsed.projectCode,
      projectName: parsed.projectName,
      actualChargeUSD: parsed.actualChargeUSD,
      estimateUSD: parsed.estimateUSD,
      exchangeRates: parsed.exchangeRates,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      budgetUSD,
      budgetByItemCode,
      hasSummary: summary !== null,
    };

    return { rows: parsed.activities, errors: validateCostTrackingActivities(parsed.activities), meta };
  },

  async apply(rows, _mode, actorId, filename, meta) {
    const m = meta as CostTrackingMeta;
    const parsed: ParsedCostTracking = {
      projectCode: m.projectCode,
      projectName: m.projectName,
      actualChargeUSD: m.actualChargeUSD,
      estimateUSD: m.estimateUSD,
      exchangeRates: m.exchangeRates,
      startDate: m.startDate,
      endDate: m.endDate,
      dateColumns: [],
      activities: rows as CostTrackingActivityRow[],
    };
    const { affected } = await applyCostTrackingImport(
      parsed,
      m.budgetUSD,
      m.budgetByItemCode,
      m.hasSummary,
      actorId,
      "data.import",
      filename,
    );
    return { affected };
  },

  async clear(actorId) {
    return db.$transaction(async (tx) => {
      const { count } = await tx.costTrackingProject.deleteMany();
      await tx.auditLog.create({
        data: { actorId, action: "data.clear", target: "cost-tracking", metadata: { affected: count } },
      });
      return { affected: count };
    });
  },
};
