import { NextResponse } from "next/server";

import type { User, UserRole } from "@prisma/client";

import { isAdmin } from "@/lib/admin";
import { resolveUser } from "@/lib/auth";

const ROLE_RANK: Record<UserRole, number> = {
  USER: 0,
  MANAGER: 1,
  ADMIN: 2,
};

export type AuthResult = { user: User } | NextResponse;

export async function requireUser(): Promise<AuthResult> {
  const result = await resolveUser();
  if (result.status === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.status === "inactive") {
    return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
  }
  return { user: result.user };
}

function hasRole(user: User, min: UserRole): boolean {
  return isAdmin(user) || ROLE_RANK[user.role] >= ROLE_RANK[min];
}

export async function requireRole(min: UserRole): Promise<AuthResult> {
  const result = await requireUser();
  if (result instanceof NextResponse) return result;
  if (hasRole(result.user, min)) return result;
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function requireAdmin(): Promise<AuthResult> {
  return requireRole("ADMIN");
}

export function assertOwnership(resourceUserId: string, user: User): boolean {
  return resourceUserId === user.id || hasRole(user, "MANAGER");
}

type RouteHandler<Ctx> = (req: Request, ctx: Ctx, user: User) => Promise<Response> | Response;

export function withAuth<Ctx = unknown>(handler: RouteHandler<Ctx>, opts?: { role?: UserRole }) {
  return async (req: Request, ctx: Ctx) => {
    const result = opts?.role ? await requireRole(opts.role) : await requireUser();
    if (result instanceof NextResponse) return result;
    return handler(req, ctx, result.user);
  };
}
