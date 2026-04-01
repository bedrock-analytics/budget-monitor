-- CreateTable
CREATE TABLE "CarBookingPassenger" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'passenger',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarBookingPassenger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarBookingPassenger_bookingId_idx" ON "CarBookingPassenger"("bookingId");

-- CreateIndex
CREATE INDEX "CarBookingPassenger_userId_idx" ON "CarBookingPassenger"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CarBookingPassenger_bookingId_userId_key" ON "CarBookingPassenger"("bookingId", "userId");

-- AddForeignKey
ALTER TABLE "CarBookingPassenger" ADD CONSTRAINT "CarBookingPassenger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "CarBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarBookingPassenger" ADD CONSTRAINT "CarBookingPassenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
