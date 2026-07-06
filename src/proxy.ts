import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";

import { isAdmin } from "@/lib/admin";
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

  // Page-level admin gate lives here (not a layout/page server component) because nested
  // layouts and their children render in parallel in the App Router -- a redirect() thrown
  // from a layout loses that race and the child page still gets served with a 200.
  const isAdminTree = !isApi && (pathname === "/admin" || pathname.startsWith("/admin/"));
  if (isAdminTree) {
    const email = typeof token.email === "string" ? token.email : null;
    const user = email
      ? await db.user.findUnique({
          where: { email },
          select: { role: true, allowedMenus: true, isActive: true },
        })
      : null;
    if (!user || !user.isActive || !isAdmin(user)) {
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
    "/budget/:path*",
    "/project/:path*",
    "/chat/:path*",
    "/purchase/:path*",
    "/booking-car/:path*",
    "/facility-quality-inspection/:path*",
    "/user/:path*",
  ],
};
