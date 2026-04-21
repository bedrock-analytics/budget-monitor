-- AlterTable: add budgetId to PurchaseRequest
ALTER TABLE "PurchaseRequest" ADD COLUMN "budgetId" TEXT;

-- Backfill: copy the first item's budgetId to its PurchaseRequest
UPDATE "PurchaseRequest" pr
SET "budgetId" = sub."budgetId"
FROM (
  SELECT DISTINCT ON ("purchaseRequestId") "purchaseRequestId", "budgetId"
  FROM "PurchaseRequestItem"
  ORDER BY "purchaseRequestId", "createdAt" ASC
) AS sub
WHERE pr."id" = sub."purchaseRequestId";

-- AddForeignKey
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "PurchaseRequest_budgetId_idx" ON "PurchaseRequest"("budgetId");

-- DropForeignKey
ALTER TABLE "PurchaseRequestItem" DROP CONSTRAINT "PurchaseRequestItem_budgetId_fkey";

-- DropIndex
DROP INDEX "PurchaseRequestItem_budgetId_idx";

-- AlterTable: remove budgetId from PurchaseRequestItem
ALTER TABLE "PurchaseRequestItem" DROP COLUMN "budgetId";
