"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PurchaseRequestRow } from "@/lib/purchase-request";

import { PRForm } from "../../_components/pr-form";

export default function EditPurchaseRequestPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [pr, setPR] = useState<PurchaseRequestRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/purchase-request/${id}`).then((r) => r.json()),
      session?.user?.email ? fetch("/api/user").then((r) => r.json()) : Promise.resolve(null),
    ])
      .then(([prData, userData]) => {
        setPR(prData.error ? null : prData);
        if (userData?.id) setUserId(userData.id);
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

  if (!pr || pr.status !== "DRAFT") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">
          {!pr ? "Purchase request not found" : "Only DRAFT requests can be edited"}
        </p>
        <Button asChild variant="outline">
          <Link href="/purchase">Back to list</Link>
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
        <h1 className="font-bold text-2xl">Edit {pr.prNumber}</h1>
        <p className="mt-1 text-muted-foreground text-sm">Update purchase request details and line items</p>
      </div>
      <PRForm requesterId={userId} initialData={pr} />
    </div>
  );
}
