/*
  Warnings:

  - You are about to alter the column `year` on the `Budget` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "year" SET DATA TYPE INTEGER,
ALTER COLUMN "budgetTHB" SET DATA TYPE DECIMAL(20,2),
ALTER COLUMN "reservedTHB" SET DATA TYPE DECIMAL(20,2),
ALTER COLUMN "actualTHB" SET DATA TYPE DECIMAL(20,2),
ALTER COLUMN "availableTHB" SET DATA TYPE DECIMAL(20,2),
ALTER COLUMN "budgetUSD" SET DATA TYPE DECIMAL(20,2),
ALTER COLUMN "reservedUSD" SET DATA TYPE DECIMAL(20,2),
ALTER COLUMN "actualUSD" SET DATA TYPE DECIMAL(20,2),
ALTER COLUMN "availableUSD" SET DATA TYPE DECIMAL(20,2);
