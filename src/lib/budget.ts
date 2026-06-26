import fs from "node:fs";
import path from "node:path";

export interface BudgetRow {
  projectType: string;
  projectTypeName: string;
  budgetItemName: string;
  year: number;
  budgetTHB: number;
  reservedTHB: number;
  actualTHB: number;
  availableTHB: number;
  budgetUSD: number;
  reservedUSD: number;
  actualUSD: number;
  availableUSD: number;
  createdAt: Date;
}

export interface ProjectSummary {
  projectType: string;
  projectName: string;
  budgetTHB: number;
  reservedTHB: number;
  actualTHB: number;
  availableTHB: number;
  budgetUSD: number;
  reservedUSD: number;
  actualUSD: number;
  availableUSD: number;
}

export interface BudgetItemSummary {
  budgetItemName: string;
  budgetTHB: number;
  reservedTHB: number;
  actualTHB: number;
  budgetUSD: number;
  reservedUSD: number;
  actualUSD: number;
  createdAt: Date;
}

export interface BudgetSummary {
  totalBudgetTHB: number;
  totalReservedTHB: number;
  totalActualTHB: number;
  totalAvailableTHB: number;
  totalBudgetUSD: number;
  totalReservedUSD: number;
  totalActualUSD: number;
  totalAvailableUSD: number;
}

export interface BudgetData {
  summary: BudgetSummary;
  byProject: ProjectSummary[];
  byBudgetItem: BudgetItemSummary[];
  rows: BudgetRow[];
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseNum(val: string): number {
  const cleaned = val.replace(/,/g, "").trim();
  return Number.parseFloat(cleaned) || 0;
}

export function parseCSVContent(content: string): BudgetRow[] {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.slice(1).map((line) => {
    const cols = parseCSVLine(line);
    return {
      projectType: cols[1]?.trim() ?? "",
      projectTypeName: cols[2]?.trim() ?? "",
      budgetItemName: cols[4]?.trim() ?? "",
      year: Number.parseInt(cols[5] ?? "0", 10),
      budgetTHB: parseNum(cols[6] ?? "0"),
      reservedTHB: parseNum(cols[7] ?? "0"),
      actualTHB: parseNum(cols[8] ?? "0"),
      availableTHB: parseNum(cols[9] ?? "0"),
      budgetUSD: parseNum(cols[10] ?? "0"),
      reservedUSD: parseNum(cols[11] ?? "0"),
      actualUSD: parseNum(cols[12] ?? "0"),
      availableUSD: parseNum(cols[13] ?? "0"),
      createdAt: new Date(),
    };
  });
}

export function parseBudgetCSV(): BudgetRow[] {
  const filePath = path.join(process.cwd(), "Budget Report 6.3.26.csv");
  const content = fs.readFileSync(filePath, "utf-8");
  return parseCSVContent(content);
}

// export function aggregateBudgetData(rows: BudgetRow[]): BudgetData {
export function aggregateBudgetData(rows: any[]): BudgetData {
  const summary: BudgetSummary = {
    totalBudgetTHB: rows.reduce((s, r) => Number(s) + Number(r.budgetTHB), 0),
    totalReservedTHB: rows.reduce((s, r) => Number(s) + Number(r.reservedTHB), 0),
    totalActualTHB: rows.reduce((s, r) => Number(s) + Number(r.actualTHB), 0),
    totalAvailableTHB: rows.reduce((s, r) => Number(s) + Number(r.availableTHB), 0),
    totalBudgetUSD: rows.reduce((s, r) => Number(s) + Number(r.budgetUSD), 0),
    totalReservedUSD: rows.reduce((s, r) => Number(s) + Number(r.reservedUSD), 0),
    totalActualUSD: rows.reduce((s, r) => Number(s) + Number(r.actualUSD), 0),
    totalAvailableUSD: rows.reduce((s, r) => Number(s) + Number(r.availableUSD), 0),
  };

  const projectMap = new Map<string, ProjectSummary>();
  for (const row of rows) {
    if (!projectMap.has(row.projectType)) {
      projectMap.set(row.projectType, {
        projectType: row.projectType,
        projectName: row.projectTypeName,
        budgetTHB: 0,
        reservedTHB: 0,
        actualTHB: 0,
        availableTHB: 0,
        budgetUSD: 0,
        reservedUSD: 0,
        actualUSD: 0,
        availableUSD: 0,
      });
    }
    const p = projectMap.get(row.projectType)!;
    p.budgetTHB += Number(row.budgetTHB);
    p.reservedTHB += Number(row.reservedTHB);
    p.actualTHB += Number(row.actualTHB);
    p.availableTHB += Number(row.availableTHB);

    p.budgetUSD += Number(row.budgetUSD);
    p.reservedUSD += Number(row.reservedUSD);
    p.actualUSD += Number(row.actualUSD);
    p.availableUSD += Number(row.availableUSD);
  }
  const byProject = Array.from(projectMap.values()).filter(
    (p) => Math.abs(p.budgetTHB) + Math.abs(p.actualTHB) + Math.abs(p.reservedTHB) > 0,
  );

  const itemMap = new Map<string, BudgetItemSummary>();
  for (const row of rows) {
    if (!itemMap.has(row.budgetItemName)) {
      itemMap.set(row.budgetItemName, {
        budgetItemName: row.budgetItemName,
        budgetTHB: 0,
        reservedTHB: 0,
        actualTHB: 0,
        budgetUSD: 0,
        reservedUSD: 0,
        actualUSD: 0,
        createdAt: new Date(),
      });
    }
    const item = itemMap.get(row.budgetItemName)!;
    item.budgetTHB += Number(row.budgetTHB);
    item.reservedTHB += Number(row.reservedTHB);
    item.actualTHB += Number(row.actualTHB);
    item.budgetUSD += Number(row.budgetUSD);
    item.reservedUSD += Number(row.reservedUSD);
    item.actualUSD += Number(row.actualUSD);
  }
  const byBudgetItem = Array.from(itemMap.values())
    .filter((i) => Math.abs(i.budgetTHB) + Math.abs(i.actualTHB) > 0)
    .sort((a, b) => b.budgetTHB - a.budgetTHB);

  return { summary, byProject, byBudgetItem, rows };
}

export function formatTHB(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    return `${sign}฿${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}฿${(abs / 1_000).toFixed(2)}K`;
  }
  return `${sign}฿${abs.toFixed(2)}`;
}
