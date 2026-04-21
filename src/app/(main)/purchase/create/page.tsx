"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { Skeleton } from "@/components/ui/skeleton";

import { PRForm } from "../_components/pr-form";

export default function CreatePurchaseRequestPage() {
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
        <h1 className="font-bold text-2xl">New Purchase Request</h1>
        <p className="mt-1 text-muted-foreground text-sm">Create a new purchase request linked to a budget line</p>
      </div>
      <PRForm requesterId={userId} />
    </div>
  );
}
