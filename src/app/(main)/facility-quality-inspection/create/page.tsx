"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { Skeleton } from "@/components/ui/skeleton";
import { HSE_QUALITY_INSPECTION_TEMPLATE } from "@/lib/facility-inspection-template";

import { InspectionForm } from "../_components/inspection-form";

export default function CreateInspectionPage() {
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
        <h1 className="font-bold text-2xl">New Inspection</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Create a new facility quality inspection — pre-filled with HSE and Quality checklist
        </p>
      </div>
      <InspectionForm inspectorId={userId} templateItems={HSE_QUALITY_INSPECTION_TEMPLATE} />
    </div>
  );
}
