/*
  Warnings:

  - Added the required column `name` to the `CarBookingPassenger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CarBookingPassenger" DROP CONSTRAINT "CarBookingPassenger_userId_fkey";

-- DropIndex
DROP INDEX "CarBookingPassenger_bookingId_userId_key";

-- AlterTable
ALTER TABLE "CarBookingPassenger" ADD COLUMN     "dateOfBirth" DATE,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CarBookingPassenger" ADD CONSTRAINT "CarBookingPassenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
