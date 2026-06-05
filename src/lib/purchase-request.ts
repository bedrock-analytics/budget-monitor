import type { Decimal } from "@prisma/client/runtime/library";

export interface PurchaseRequestRow {
  id: string;
  prNumber: string;
  orderType: "PURCHASE_ORDER" | "SERVICE_ORDER";
  title: string;
  description: string | null;
  department: string | null;
  status: string;
  currency: string;
  totalAmount: number;
  notes: string | null;
  dueDate: string | null;
  deliveryTo: string | null;
  proposedStrategy: "CALL_FOR_TENDER" | "DIRECT_NEGOTIATION" | null;
  businessJustification: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  requester: {
    id: string;
    name: string | null;
    email: string;
  };
  budget: {
    id: string;
    projectTypeName: string;
    budgetItemName: string;
    availableTHB: number;
    availableUSD: number;
  } | null;
  items: PurchaseRequestItemRow[];
  attachments: PurchaseRequestAttachmentRow[];
}

export interface PurchaseRequestAttachmentRow {
  id: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

export interface PurchaseRequestItemRow {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface BudgetOption {
  id: string;
  projectType: string;
  projectTypeName: string;
  budgetItemName: string;
  year: number;
  availableTHB: number;
  availableUSD: number;
}

export function generatePRNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `PR-${year}${month}-${random}`;
}

export function toNumber(value: Decimal | number): number {
  return typeof value === "number" ? value : Number(value);
}
