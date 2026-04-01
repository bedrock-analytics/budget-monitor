"use client";

import { type ReactNode, useEffect } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [router, status]);

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
