-- CreateTable
CREATE TABLE "CostTrackingProject" (
    "id" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "startDate" DATE,
    "endDate" DATE,
    "actualChargeUSD" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "estimateUSD" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "exchangeRates" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostTrackingProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CostTrackingProject_projectCode_key" ON "CostTrackingProject"("projectCode");

-- CreateIndex
CREATE INDEX "CostTrackingProject_createdAt_idx" ON "CostTrackingProject"("createdAt");

-- CreateTable
CREATE TABLE "CostTrackingActivity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "groupName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "lumpSum" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "rate" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "invoiceLocal" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "invoiceUSD" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "sumPOLocal" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "sumPOUSD" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "trackingAmount" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "poEstAmount" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "dailyValues" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostTrackingActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CostTrackingActivity_projectId_idx" ON "CostTrackingActivity"("projectId");

-- CreateIndex
CREATE INDEX "CostTrackingActivity_itemCode_idx" ON "CostTrackingActivity"("itemCode");

-- AddForeignKey
ALTER TABLE "CostTrackingActivity" ADD CONSTRAINT "CostTrackingActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CostTrackingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
