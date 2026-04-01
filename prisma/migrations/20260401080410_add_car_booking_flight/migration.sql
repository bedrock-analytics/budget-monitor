-- CreateTable
CREATE TABLE "CarBookingFlight" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "flightNumber" TEXT,
    "airline" TEXT,
    "route" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarBookingFlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarBookingFlight_bookingId_idx" ON "CarBookingFlight"("bookingId");

-- AddForeignKey
ALTER TABLE "CarBookingFlight" ADD CONSTRAINT "CarBookingFlight_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "CarBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
