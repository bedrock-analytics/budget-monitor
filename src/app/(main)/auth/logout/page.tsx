"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import { deleteClientCookie } from "@/lib/cookie.client";

export default function LogoutPage() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    deleteClientCookie("accessToken");
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Signing you out...</p>
      </div>
    </div>
  );
}
