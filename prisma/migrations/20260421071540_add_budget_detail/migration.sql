-- CreateTable
CREATE TABLE "BudgetDetail" (
    "id" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "budgetCategory" TEXT NOT NULL,
    "budgetItemName" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "acctCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "date" DATE,
    "vendor" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "reservedTHB" DECIMAL(20,2) NOT NULL,
    "actualTHB" DECIMAL(20,2) NOT NULL,
    "totalSpentTHB" DECIMAL(20,2) NOT NULL,
    "rate" DECIMAL(20,6) NOT NULL,
    "reservedUSD" DECIMAL(20,2) NOT NULL,
    "actualUSD" DECIMAL(20,2) NOT NULL,
    "totalSpentUSD" DECIMAL(20,2) NOT NULL,
    "creator" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetDetail_projectType_budgetItemName_idx" ON "BudgetDetail"("projectType", "budgetItemName");

-- CreateIndex
CREATE INDEX "BudgetDetail_createdAt_idx" ON "BudgetDetail"("createdAt");
