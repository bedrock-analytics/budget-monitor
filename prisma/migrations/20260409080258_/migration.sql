-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('PASS', 'FAIL', 'CONDITIONAL', 'PENDING');

-- CreateEnum
CREATE TYPE "InspectionItemResult" AS ENUM ('PASS', 'FAIL', 'NA', 'PENDING');

-- CreateTable
CREATE TABLE "FacilityQualityInspection" (
    "id" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "facilityName" TEXT NOT NULL,
    "facilityLocation" TEXT,
    "inspectionType" TEXT NOT NULL,
    "inspectionDate" DATE NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'DRAFT',
    "overallResult" "InspectionResult" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityQualityInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityQualityInspectionItem" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "checkItem" TEXT NOT NULL,
    "result" "InspectionItemResult" NOT NULL DEFAULT 'PENDING',
    "severity" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityQualityInspectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacilityQualityInspection_inspectionNumber_key" ON "FacilityQualityInspection"("inspectionNumber");

-- CreateIndex
CREATE INDEX "FacilityQualityInspection_inspectorId_idx" ON "FacilityQualityInspection"("inspectorId");

-- CreateIndex
CREATE INDEX "FacilityQualityInspection_status_idx" ON "FacilityQualityInspection"("status");

-- CreateIndex
CREATE INDEX "FacilityQualityInspection_inspectionDate_idx" ON "FacilityQualityInspection"("inspectionDate");

-- CreateIndex
CREATE INDEX "FacilityQualityInspection_createdAt_idx" ON "FacilityQualityInspection"("createdAt");

-- CreateIndex
CREATE INDEX "FacilityQualityInspectionItem_inspectionId_idx" ON "FacilityQualityInspectionItem"("inspectionId");

-- AddForeignKey
ALTER TABLE "FacilityQualityInspection" ADD CONSTRAINT "FacilityQualityInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityQualityInspectionItem" ADD CONSTRAINT "FacilityQualityInspectionItem_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "FacilityQualityInspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
