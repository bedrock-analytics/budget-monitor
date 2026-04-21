-- CreateEnum
CREATE TYPE "PurchaseStrategy" AS ENUM ('CALL_FOR_TENDER', 'DIRECT_NEGOTIATION');

-- AlterTable
ALTER TABLE "PurchaseRequest" ADD COLUMN "proposedStrategy" "PurchaseStrategy",
ADD COLUMN "businessJustification" TEXT;
