"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import type { CarBookingRow } from "@/lib/booking-car";
import { Skeleton } from "@/components/ui/skeleton";

import { BookingForm } from "../../_components/booking-form";

export default function EditBookingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [booking, setBooking] = useState<CarBookingRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, bookingsRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/booking-car"),
      ]);

      if (userRes.ok) {
        const { user } = await userRes.json();
        setUserId(user.id);
      }

      if (bookingsRes.ok) {
        const bookings: CarBookingRow[] = await bookingsRes.json();
        const found = bookings.find((b) => b.id === id);
        if (found) {
          setBooking(found);
        } else {
          setError("Booking not found");
        }
      }
    } catch {
      setError("Failed to load booking");
    }
  }, [id]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchData();
    }
  }, [session?.user?.email, fetchData]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!userId || !booking) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-2xl">Edit Booking</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Edit booking {booking.bookingNumber}
        </p>
      </div>
      <BookingForm userId={userId} booking={booking} />
    </div>
  );
}
