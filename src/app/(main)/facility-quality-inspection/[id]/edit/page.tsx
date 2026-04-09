"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { InspectionRow } from "@/lib/facility-quality-inspection";

import { InspectionForm } from "../../_components/inspection-form";

export default function EditInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [inspection, setInspection] = useState<InspectionRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/facility-quality-inspection/${id}`).then((r) => r.json()),
      session?.user?.email ? fetch("/api/user").then((r) => r.json()) : Promise.resolve(null),
    ])
      .then(([inspectionData, userData]) => {
        setInspection(inspectionData.error ? null : inspectionData);
        if (userData?.user?.id) setUserId(userData.user.id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, session?.user?.email]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!inspection || inspection.status !== "DRAFT") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">
          {!inspection ? "Inspection not found" : "Only DRAFT inspections can be edited"}
        </p>
        <Button asChild variant="outline">
          <Link href="/facility-quality-inspection">Back to list</Link>
        </Button>
      </div>
    );
  }

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
        <h1 className="font-bold text-2xl">Edit {inspection.inspectionNumber}</h1>
        <p className="mt-1 text-muted-foreground text-sm">Update inspection details and checklist items</p>
      </div>
      <InspectionForm inspectorId={userId} initialData={inspection} />
    </div>
  );
}
