-- CreateTable
CREATE TABLE "CarBookingTrip" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarBookingTrip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarBookingTrip_bookingId_idx" ON "CarBookingTrip"("bookingId");

-- CreateIndex
CREATE INDEX "CarBookingTrip_date_idx" ON "CarBookingTrip"("date");

-- AddForeignKey
ALTER TABLE "CarBookingTrip" ADD CONSTRAINT "CarBookingTrip_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "CarBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
