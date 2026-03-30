"use client";

import { type ReactNode, use, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      setIsAuthorized(true);
    }
    if (!session) {
      router.replace("/auth/login");
    }
  }, [router, session]);

  if (!isAuthorized) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
