-- CreateEnum
CREATE TYPE "PurchaseOrderType" AS ENUM ('PURCHASE_ORDER', 'SERVICE_ORDER');

-- AlterTable
ALTER TABLE "PurchaseRequest" ADD COLUMN "orderType" "PurchaseOrderType" NOT NULL DEFAULT 'PURCHASE_ORDER';
