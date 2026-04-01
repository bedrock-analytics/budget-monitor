-- CreateTable
CREATE TABLE "CarBookingHotel" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarBookingHotel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarBookingHotel_bookingId_idx" ON "CarBookingHotel"("bookingId");

-- AddForeignKey
ALTER TABLE "CarBookingHotel" ADD CONSTRAINT "CarBookingHotel_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "CarBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
