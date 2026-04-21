/*
  Warnings:

  - You are about to drop the column `severity` on the `FacilityQualityInspectionItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FacilityQualityInspectionItem" DROP COLUMN "severity",
ADD COLUMN     "actionParty" TEXT,
ADD COLUMN     "correctiveAction" TEXT,
ADD COLUMN     "priority" TEXT;
