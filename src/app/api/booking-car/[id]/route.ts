import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      projectCode,
      projectType,
      type,
      carName,
      licensePlate,
      purpose,
      destination,
      startDate,
      endDate,
      notes,
      passengers,
      hotels,
      flights,
      trips,
    } = body;

    const existing = await db.carBooking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    // Update core booking fields if provided
    const bookingUpdate: Record<string, unknown> = {};
    if (projectCode !== undefined) bookingUpdate.projectCode = projectCode || null;
    if (projectType !== undefined) bookingUpdate.projectType = projectType || null;
    if (type !== undefined) bookingUpdate.type = type || null;
    if (carName !== undefined) bookingUpdate.carName = carName;
    if (licensePlate !== undefined) bookingUpdate.licensePlate = licensePlate;
    if (purpose !== undefined) bookingUpdate.purpose = purpose;
    if (destination !== undefined) bookingUpdate.destination = destination || null;
    if (startDate !== undefined) bookingUpdate.startDate = new Date(startDate);
    if (endDate !== undefined) bookingUpdate.endDate = new Date(endDate);
    if (notes !== undefined) bookingUpdate.notes = notes || null;

    if (Object.keys(bookingUpdate).length > 0) {
      await db.carBooking.update({ where: { id }, data: bookingUpdate });
    }

    // Update passengers if provided
    if (passengers !== undefined) {
      await db.carBookingPassenger.deleteMany({ where: { bookingId: id } });

      const passengerList = (
        passengers as {
          name: string;
          email?: string;
          phone?: string;
          dateOfBirth?: string;
          role?: string;
          userId?: string;
          usePersonalCar?: boolean;
        }[]
      );

      // Sync phone/dateOfBirth to User table if User fields are empty
      for (const p of passengerList) {
        if (p.userId && (p.phone || p.dateOfBirth)) {
          const user = await db.user.findUnique({ where: { id: p.userId } });
          if (user) {
            const update: Record<string, unknown> = {};
            if (!user.phone && p.phone) update.phone = p.phone;
            if (!user.dateOfBirth && p.dateOfBirth)
              update.dateOfBirth = new Date(p.dateOfBirth);
            if (Object.keys(update).length > 0) {
              await db.user.update({ where: { id: p.userId }, data: update });
            }
          }
        }
      }

      const newPassengers = passengerList.map((p) => ({
        bookingId: id,
        userId: p.userId || null,
        role: p.role || "passenger",
        name: p.name,
        email: p.email || null,
        phone: p.phone || null,
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
        usePersonalCar: p.usePersonalCar || false,
      }));

      if (newPassengers.length > 0) {
        await db.carBookingPassenger.createMany({ data: newPassengers });
      }
    }

    // Update hotels if provided
    if (hotels !== undefined) {
      await db.carBookingHotel.deleteMany({ where: { bookingId: id } });

      const newHotels = (hotels as { hotelName: string; checkInDate: string; checkOutDate: string }[]).map((h) => ({
        bookingId: id,
        hotelName: h.hotelName,
        checkInDate: new Date(h.checkInDate),
        checkOutDate: new Date(h.checkOutDate),
      }));

      if (newHotels.length > 0) {
        await db.carBookingHotel.createMany({ data: newHotels });
      }
    }

    // Update flights if provided
    if (flights !== undefined) {
      await db.carBookingFlight.deleteMany({ where: { bookingId: id } });

      const newFlights = (
        flights as {
          flightNumber?: string;
          airline?: string;
          route: string;
          departureTime: string;
          arrivalTime: string;
          notes?: string;
        }[]
      ).map((f) => ({
        bookingId: id,
        flightNumber: f.flightNumber || null,
        airline: f.airline || null,
        route: f.route,
        departureTime: new Date(f.departureTime),
        arrivalTime: new Date(f.arrivalTime),
        notes: f.notes || null,
      }));

      if (newFlights.length > 0) {
        await db.carBookingFlight.createMany({ data: newFlights });
      }
    }

    // Update trips if provided
    if (trips !== undefined) {
      await db.carBookingTrip.deleteMany({ where: { bookingId: id } });

      const newTrips = (
        trips as {
          date: string;
          departureTime: string;
          arrivalTime: string;
          origin: string;
          destination: string;
          description?: string;
        }[]
      ).map((t) => ({
        bookingId: id,
        date: new Date(t.date),
        departureTime: new Date(t.departureTime),
        arrivalTime: new Date(t.arrivalTime),
        origin: t.origin,
        destination: t.destination,
        description: t.description || null,
      }));

      if (newTrips.length > 0) {
        await db.carBookingTrip.createMany({ data: newTrips });
      }
    }

    // Update status if provided
    if (status) {
      const updateData: Record<string, unknown> = { status };
      if (status === "APPROVED") updateData.approvedAt = new Date();
      if (status === "REJECTED") updateData.rejectedAt = new Date();

      await db.carBooking.update({
        where: { id },
        data: updateData,
      });
    }

    const updated = await db.carBooking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, dateOfBirth: true } },
        passengers: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, dateOfBirth: true } },
          },
        },
        hotels: true,
        flights: true,
        trips: { orderBy: { date: "asc" } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update car booking:", error);
    return NextResponse.json(
      { error: "Failed to update car booking" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.carBooking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    await db.carBooking.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete car booking:", error);
    return NextResponse.json(
      { error: "Failed to delete car booking" },
      { status: 500 },
    );
  }
}
