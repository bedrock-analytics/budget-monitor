export interface BudgetDetailRow {
  projectType: string;
  projectCode: string;
  budgetCategory: string;
  budgetItemName: string;
  system: string;
  type: string;
  no: string;
  acctCode: string;
  accountName: string;
  date: Date | null;
  vendor: string;
  remark: string;
  reservedTHB: number;
  actualTHB: number;
  totalSpentTHB: number;
  rate: number;
  reservedUSD: number;
  actualUSD: number;
  totalSpentUSD: number;
  creator: string;
}

function parseRecords(content: string): string[][] {
  const text = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
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
      if (record.length > 1 || record[0] !== "") {
        records.push(record);
      }
      record = [];
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field);
    if (record.length > 1 || record[0] !== "") {
      records.push(record);
    }
  }

  return records;
}

function parseNum(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/,/g, "").trim();
  return Number.parseFloat(cleaned) || 0;
}

function parseDate(val: string | undefined): Date | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map((p) => Number.parseInt(p, 10));
  if (!d || !m || !y) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractProjectType(val: string | undefined): string {
  if (!val) return "";
  const trimmed = val.trim();
  const idx = trimmed.indexOf(" - ");
  return idx >= 0 ? trimmed.slice(0, idx).trim() : trimmed;
}

const ALLOWED_TYPES = new Set(["PO", "PR", "DraftPR"]);

export function parseBudgetDetailCSV(content: string): BudgetDetailRow[] {
  const records = parseRecords(content);
  if (records.length === 0) return [];

  return records
    .slice(1)
    .map((cols) => ({
      projectType: extractProjectType(cols[0]),
      projectCode: cols[1]?.trim() ?? "",
      budgetCategory: cols[2]?.trim() ?? "",
      budgetItemName: cols[3]?.trim() ?? "",
      system: cols[4]?.trim() ?? "",
      type: cols[5]?.trim() ?? "",
      no: cols[6]?.trim() ?? "",
      acctCode: cols[7]?.trim() ?? "",
      accountName: cols[8]?.trim() ?? "",
      date: parseDate(cols[9]),
      vendor: cols[10]?.trim() ?? "",
      remark: cols[11]?.trim() ?? "",
      reservedTHB: parseNum(cols[12]),
      actualTHB: parseNum(cols[13]),
      totalSpentTHB: parseNum(cols[14]),
      rate: parseNum(cols[15]),
      reservedUSD: parseNum(cols[16]),
      actualUSD: parseNum(cols[17]),
      totalSpentUSD: parseNum(cols[18]),
      creator: cols[19]?.trim() ?? "",
    }))
    .filter((r) => ALLOWED_TYPES.has(r.type));
}
