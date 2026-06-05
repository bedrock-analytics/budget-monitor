export interface DailyValue {
  date: string;
  value: number;
}

export interface ActivityRecord {
  id: string;
  position: number;
  groupName: string;
  description: string;
  itemCode: string;
  lumpSum: string | number;
  rate: string | number;
  invoiceLocal: string | number;
  invoiceUSD: string | number;
  sumPOLocal: string | number;
  currency: string;
  sumPOUSD: string | number;
  trackingAmount: string | number;
  poEstAmount: string | number;
  dailyValues: DailyValue[];
}

export interface ProjectDetail {
  id: string;
  projectCode: string;
  projectName: string;
  startDate: string | null;
  endDate: string | null;
  actualChargeUSD: string | number;
  estimateUSD: string | number;
  budgetUSD: string | number;
  exchangeRates: Record<string, number> | null;
  budgetByItemCode: Record<string, number> | null;
  activities: ActivityRecord[];
}

export interface ProjectListItem {
  id: string;
  projectCode: string;
  projectName: string;
  startDate: string | null;
  endDate: string | null;
  actualChargeUSD: string | number;
  estimateUSD: string | number;
  budgetUSD: string | number;
  updatedAt: string;
}
