-- CreateEnum
CREATE TYPE "CarBookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_USE', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "CarBooking" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carName" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "destination" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "CarBookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarBooking_bookingNumber_key" ON "CarBooking"("bookingNumber");

-- CreateIndex
CREATE INDEX "CarBooking_userId_idx" ON "CarBooking"("userId");

-- CreateIndex
CREATE INDEX "CarBooking_status_idx" ON "CarBooking"("status");

-- CreateIndex
CREATE INDEX "CarBooking_startDate_endDate_idx" ON "CarBooking"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "CarBooking_createdAt_idx" ON "CarBooking"("createdAt");

-- AddForeignKey
ALTER TABLE "CarBooking" ADD CONSTRAINT "CarBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
