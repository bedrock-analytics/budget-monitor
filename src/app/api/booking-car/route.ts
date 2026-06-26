import { NextResponse } from "next/server";

import { generateBookingNumber } from "@/lib/booking-car";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const data = await db.carBooking.findMany({
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch car bookings:", error);
    return NextResponse.json({ error: "Failed to fetch car bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      projectCode,
      projectType,
      type,
      carName,
      licensePlate,
      purpose,
      pickupLocation,
      destination,
      startDate,
      endDate,
      notes,
      passengers,
      hotels,
      flights,
      trips,
    } = body;

    if (!userId || !carName || !licensePlate || !purpose || !pickupLocation || !startDate || !endDate) {
      return NextResponse.json({ error: "User, car, purpose, pick-up, and dates are required" }, { status: 400 });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    // Check for overlapping bookings on the same car
    const overlapping = await db.carBooking.findFirst({
      where: {
        licensePlate,
        status: { in: ["PENDING", "APPROVED", "IN_USE"] },
        startDate: { lt: new Date(endDate) },
        endDate: { gt: new Date(startDate) },
      },
    });

    if (overlapping) {
      return NextResponse.json({ error: "This car is already booked for the selected dates" }, { status: 409 });
    }

    // Sync passenger phone/dateOfBirth to User table if User fields are empty
    const passengerList = (passengers || []) as {
      name: string;
      email?: string;
      phone?: string;
      dateOfBirth?: string;
      role?: string;
      userId?: string;
      usePersonalCar?: boolean;
    }[];

    for (const p of passengerList) {
      if (p.userId && (p.phone || p.dateOfBirth)) {
        const user = await db.user.findUnique({ where: { id: p.userId } });
        if (user) {
          const update: Record<string, unknown> = {};
          if (!user.phone && p.phone) update.phone = p.phone;
          if (!user.dateOfBirth && p.dateOfBirth) update.dateOfBirth = new Date(p.dateOfBirth);
          if (Object.keys(update).length > 0) {
            await db.user.update({ where: { id: p.userId }, data: update });
          }
        }
      }
    }

    const booking = await db.carBooking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        userId,
        projectCode: projectCode || null,
        projectType: projectType || null,
        type: type || null,
        carName,
        licensePlate,
        purpose,
        pickupLocation,
        destination: destination || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes: notes || null,
        passengers: {
          create: passengerList.map((p) => ({
            userId: p.userId || null,
            role: p.role || "passenger",
            name: p.name,
            email: p.email || null,
            phone: p.phone || null,
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
            usePersonalCar: p.usePersonalCar || false,
          })),
        },
        hotels: {
          create: (hotels || []).map((h: { hotelName: string; checkInDate: string; checkOutDate: string }) => ({
            hotelName: h.hotelName,
            checkInDate: new Date(h.checkInDate),
            checkOutDate: new Date(h.checkOutDate),
          })),
        },
        flights: {
          create: (flights || []).map(
            (f: {
              flightNumber?: string;
              airline?: string;
              route: string;
              departureTime: string;
              arrivalTime: string;
              notes?: string;
            }) => ({
              flightNumber: f.flightNumber || null,
              airline: f.airline || null,
              route: f.route,
              departureTime: new Date(f.departureTime),
              arrivalTime: new Date(f.arrivalTime),
              notes: f.notes || null,
            }),
          ),
        },
        trips: {
          create: (trips || []).map(
            (t: {
              date: string;
              departureTime: string;
              arrivalTime: string;
              origin: string;
              destination: string;
              description?: string;
            }) => ({
              date: new Date(t.date),
              departureTime: new Date(t.departureTime),
              arrivalTime: new Date(t.arrivalTime),
              origin: t.origin,
              destination: t.destination,
              description: t.description || null,
            }),
          ),
        },
      },
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

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Failed to create car booking:", error);
    return NextResponse.json({ error: "Failed to create car booking" }, { status: 500 });
  }
}
