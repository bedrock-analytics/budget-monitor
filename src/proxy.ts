import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";

import { isAdmin } from "@/lib/admin";
import { hasRole } from "@/lib/authz";
import { db } from "@/lib/db";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (isApi && pathname.startsWith("/api/auth/")) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const email = typeof token.email === "string" ? token.email : null;
  const user = email
    ? await db.user.findUnique({
        where: { email },
        select: { role: true, allowedMenus: true, isActive: true },
      })
    : null;

  // Reject a deactivated account here, once, for every matched route -- rather than relying on
  // whichever per-route helper happens to run (lib/auth's requireUser and authz.ts's requireUser
  // return different status codes -- 401 generic vs 403 "Account deactivated" -- for the same
  // condition). `user` is null for a brand-new Cognito login whose row hasn't been upserted yet
  // (resolveUser() does that on first API call), so only an explicit isActive:false is rejected
  // here -- a missing row must fall through to let first-login provisioning happen.
  if (user?.isActive === false) {
    if (isApi) {
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Page-level admin/manager gates live here (not a layout/page server component) because nested
  // layouts and their children render in parallel in the App Router -- a redirect() thrown
  // from a layout loses that race and the child page still gets served with a 200.
  const isAdminTree = !isApi && (pathname === "/admin" || pathname.startsWith("/admin/"));
  const isDataManagementTree = !isApi && (pathname === "/data-management" || pathname.startsWith("/data-management/"));

  if (isAdminTree || isDataManagementTree) {
    const authorized = !!user && (isAdminTree ? isAdmin(user) : hasRole(user, "MANAGER"));
    if (!authorized) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/data-management/:path*",
    "/budget/:path*",
    "/project/:path*",
    "/chat/:path*",
    "/purchase/:path*",
    "/booking-car/:path*",
    "/facility-quality-inspection/:path*",
    "/user/:path*",
  ],
};
