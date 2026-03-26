/*
  Warnings:

  - Made the column `projectTypeName` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `budgetItemName` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `year` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `budgetTHB` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reservedTHB` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `actualTHB` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `availableTHB` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `budgetUSD` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reservedUSD` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `actualUSD` on table `Budget` required. This step will fail if there are existing NULL values in that column.
  - Made the column `availableUSD` on table `Budget` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "projectTypeName" SET NOT NULL,
ALTER COLUMN "budgetItemName" SET NOT NULL,
ALTER COLUMN "year" SET NOT NULL,
ALTER COLUMN "budgetTHB" SET NOT NULL,
ALTER COLUMN "reservedTHB" SET NOT NULL,
ALTER COLUMN "actualTHB" SET NOT NULL,
ALTER COLUMN "availableTHB" SET NOT NULL,
ALTER COLUMN "budgetUSD" SET NOT NULL,
ALTER COLUMN "reservedUSD" SET NOT NULL,
ALTER COLUMN "actualUSD" SET NOT NULL,
ALTER COLUMN "availableUSD" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Budget_createdAt_idx" ON "Budget"("createdAt");
