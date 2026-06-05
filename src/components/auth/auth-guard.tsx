"use client";

import { type ReactNode, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { useAllowedMenus } from "@/hooks/use-allowed-menus";
import { isPathAllowed } from "@/navigation/sidebar/access";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { data: allowedMenus, isLoading } = useAllowedMenus(status === "authenticated");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }
    if (status === "authenticated" && !isLoading && !isPathAllowed(pathname, allowedMenus)) {
      router.replace("/unauthorized");
    }
  }, [router, status, pathname, allowedMenus, isLoading]);

  if (status === "authenticated" && !isLoading && isPathAllowed(pathname, allowedMenus)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
