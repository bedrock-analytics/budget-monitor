export interface CostTrackingDailyValue {
  date: string;
  value: number;
}

export interface CostTrackingActivityRow {
  position: number;
  groupName: string;
  description: string;
  itemCode: string;
  lumpSum: number;
  rate: number;
  invoiceLocal: number;
  invoiceUSD: number;
  sumPOLocal: number;
  currency: string;
  sumPOUSD: number;
  trackingAmount: number;
  poEstAmount: number;
  dailyValues: CostTrackingDailyValue[];
}

export interface ParsedCostTracking {
  projectCode: string;
  projectName: string;
  actualChargeUSD: number;
  estimateUSD: number;
  exchangeRates: Record<string, number>;
  startDate: Date | null;
  endDate: Date | null;
  dateColumns: string[];
  activities: CostTrackingActivityRow[];
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function parseRecords(content: string): string[][] {
  const text = stripBom(content);
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      record.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      field = "";
      records.push(record);
      record = [];
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
}

function parseNum(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === "-") return 0;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function parseDateHeader(val: string | undefined): Date | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("-");
  if (parts.length !== 3) return null;
  const day = Number.parseInt(parts[0], 10);
  const month = MONTHS[parts[1].toLowerCase().slice(0, 3)];
  const yearRaw = Number.parseInt(parts[2], 10);
  if (!day || month === undefined || Number.isNaN(yearRaw)) return null;
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  const d = new Date(Date.UTC(year, month, day));
  return Number.isNaN(d.getTime()) ? null : d;
}

function extractProjectMeta(headerCell: string): {
  projectCode: string;
  projectName: string;
} {
  const trimmed = headerCell.trim();
  const match = trimmed.match(/^(.*)\(([^()]+)\)\s*$/);
  if (match) {
    return {
      projectName: match[1].trim(),
      projectCode: match[2].trim(),
    };
  }
  return { projectName: trimmed, projectCode: trimmed };
}

const HEADER_COL_COUNT = 12;

export function parseCostTrackingCSV(content: string): ParsedCostTracking {
  const records = parseRecords(content);
  if (records.length === 0) {
    throw new Error("Empty CSV file");
  }

  const projectHeader = records[0]?.[1] ?? "";
  const { projectCode, projectName } = extractProjectMeta(projectHeader);

  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(records.length, 30); i++) {
    if (records[i]?.[1]?.trim().toLowerCase() === "activities") {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx < 0) {
    const preview = records
      .slice(0, 5)
      .map(
        (row, i) =>
          `row ${i}: ${row
            .slice(0, 4)
            .map((c) => `"${c?.trim() ?? ""}"`)
            .join(", ")}`,
      )
      .join(" | ");
    throw new Error(`Could not locate Activities header row. First rows seen: ${preview}`);
  }

  const headerRow = records[headerRowIdx];
  const dateColumns: string[] = [];
  const dateObjs: (Date | null)[] = [];
  for (let c = HEADER_COL_COUNT; c < headerRow.length; c++) {
    const d = parseDateHeader(headerRow[c]);
    dateObjs.push(d);
    dateColumns.push(d ? d.toISOString().slice(0, 10) : "");
  }

  const activities: CostTrackingActivityRow[] = [];
  let currentGroup = "";
  let position = 0;
  const exchangeRates: Record<string, number> = {};

  for (let r = headerRowIdx + 1; r < records.length; r++) {
    const row = records[r];

    if (row[4]?.trim() === "Actual Charge") {
      continue;
    }

    const fxValue = parseNum(row[12]);
    const fxCurrency = row[13]?.trim();
    const fxBaseLabel = row[15]?.trim();
    if (fxValue > 0 && fxCurrency && fxBaseLabel === "USD") {
      exchangeRates[fxCurrency] = fxValue;
      continue;
    }

    const groupCell = row[0]?.trim() ?? "";
    if (groupCell) currentGroup = groupCell;

    const description = row[1]?.trim() ?? "";
    const itemCode = row[2]?.trim() ?? "";
    if (!description || !itemCode) continue;

    const dailyValues: CostTrackingDailyValue[] = [];
    for (let c = HEADER_COL_COUNT; c < row.length; c++) {
      const value = parseNum(row[c]);
      if (value === 0) continue;
      const dateIdx = c - HEADER_COL_COUNT;
      const date = dateColumns[dateIdx];
      if (!date) continue;
      dailyValues.push({ date, value });
    }

    activities.push({
      position: position++,
      groupName: currentGroup,
      description,
      itemCode,
      lumpSum: parseNum(row[3]),
      rate: parseNum(row[4]),
      invoiceLocal: parseNum(row[5]),
      invoiceUSD: parseNum(row[6]),
      sumPOLocal: parseNum(row[7]),
      currency: row[8]?.trim() || "USD",
      sumPOUSD: parseNum(row[9]),
      trackingAmount: parseNum(row[10]),
      poEstAmount: parseNum(row[11]),
      dailyValues,
    });
  }

  const validDates = dateObjs.filter((d): d is Date => d !== null);
  const startDate = validDates[0] ?? null;
  const endDate = validDates[validDates.length - 1] ?? null;

  const sumInvoiceUSD = activities.reduce((acc, a) => acc + a.invoiceUSD, 0);
  const sumPOUSDTotal = activities.reduce((acc, a) => acc + a.sumPOUSD, 0);

  return {
    projectCode,
    projectName,
    actualChargeUSD: sumInvoiceUSD,
    estimateUSD: sumPOUSDTotal,
    exchangeRates,
    startDate,
    endDate,
    dateColumns: dateColumns.filter(Boolean),
    activities,
  };
}

export interface ParsedBudgetSummary {
  projectCode: string;
  projectRevenue: number;
  budgetByItemCode: Record<string, number>;
}

export function parseBudgetSummaryCSV(content: string): ParsedBudgetSummary {
  const records = parseRecords(content);

  let projectCode = "";
  let projectRevenue = 0;
  let headerRowIdx = -1;

  for (let i = 0; i < Math.min(records.length, 20); i++) {
    const row = records[i];
    const label = row[0]?.trim().toLowerCase() ?? "";
    if (label.startsWith("project revenue")) {
      projectRevenue = parseNum(row[1]?.replace(/\$/g, ""));
    } else if (label.startsWith("project code")) {
      projectCode = row[1]?.trim() ?? "";
    } else if (label === "detail" && row[1]?.trim().toLowerCase() === "total cost") {
      headerRowIdx = i;
    }
  }

  const budgetByItemCode: Record<string, number> = {};
  if (headerRowIdx >= 0) {
    for (let r = headerRowIdx + 1; r < records.length; r++) {
      const row = records[r];
      const itemCode = row[2]?.trim() ?? "";
      if (!itemCode) continue;
      const cost = parseNum(row[1]);
      if (cost === 0) continue;
      budgetByItemCode[itemCode] = (budgetByItemCode[itemCode] ?? 0) + cost;
    }
  }

  return { projectCode, projectRevenue, budgetByItemCode };
}

export function isBudgetSummaryCSV(content: string): boolean {
  const records = parseRecords(content);
  for (let i = 0; i < Math.min(records.length, 10); i++) {
    const label = records[i]?.[0]?.trim().toLowerCase() ?? "";
    if (label.startsWith("project revenue") || label.startsWith("project name")) return true;
  }
  return false;
}

export function formatUSDCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}
