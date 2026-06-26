"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { Skeleton } from "@/components/ui/skeleton";

import { BookingForm } from "../_components/booking-form";

export default function CreateBookingPage() {
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/user")
        .then((res) => res.json())
        .then(({ user }) => setUserId(user.id))
        .catch(console.error);
    }
  }, [session?.user?.email]);

  if (!userId) {
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
        <h1 className="font-bold text-2xl">New Car Booking</h1>
        <p className="mt-1 text-muted-foreground text-sm">Book a company car for your trip</p>
      </div>
      <BookingForm userId={userId} />
    </div>
  );
}
