-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "projectTypeName" TEXT,
    "budgetItemName" TEXT,
    "year" Int,
    "budgetTHB" Float,
    "reservedTHB" Float,
    "actualTHB" Float,
    "availableTHB" Float,
    "budgetUSD" Float,
    "reservedUSD" Float,
    "actualUSD" Float,
    "availableUSD" Float,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);