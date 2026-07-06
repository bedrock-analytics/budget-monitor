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
  const { data, isLoading } = useAllowedMenus(status === "authenticated");
  const allowedMenus = data?.allowedMenus;
  const isAdmin = data?.isAdmin ?? false;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }
    if (status === "authenticated" && !isLoading && !isPathAllowed(pathname, allowedMenus, isAdmin)) {
      router.replace("/unauthorized");
    }
  }, [router, status, pathname, allowedMenus, isAdmin, isLoading]);

  if (status === "authenticated" && !isLoading && isPathAllowed(pathname, allowedMenus, isAdmin)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
