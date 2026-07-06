import { NextResponse } from "next/server";

import { type Prisma, UserRole } from "@prisma/client";
import { z } from "zod";

import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, department: true, allowedMenus: true, role: true, isActive: true },
    orderBy: { email: "asc" },
  });
  return NextResponse.json({ users });
}

const UpdateSchema = z.object({
  userId: z.string().min(1),
  allowedMenus: z.array(z.string().min(1)).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { user: actor } = auth;

  const body = UpdateSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { userId, allowedMenus, role, isActive } = body.data;

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const nextRole = role ?? target.role;
  const nextIsActive = isActive ?? target.isActive;
  const targetIsCurrentlyActiveAdmin = target.role === "ADMIN" && target.isActive;
  const wouldLoseAdminStatus = nextRole !== "ADMIN" || !nextIsActive;

  if (targetIsCurrentlyActiveAdmin && wouldLoseAdminStatus) {
    const otherActiveAdmins = await db.user.count({
      where: { role: "ADMIN", isActive: true, id: { not: userId } },
    });
    if (otherActiveAdmins === 0) {
      return NextResponse.json({ error: "Cannot demote or deactivate the last remaining admin" }, { status: 409 });
    }
  }

  const changes: Record<string, { from: unknown; to: unknown }> = {};
  if (allowedMenus !== undefined) changes.allowedMenus = { from: target.allowedMenus, to: allowedMenus };
  if (role !== undefined && role !== target.role) changes.role = { from: target.role, to: role };
  if (isActive !== undefined && isActive !== target.isActive)
    changes.isActive = { from: target.isActive, to: isActive };

  const updated = await db.$transaction(async (tx) => {
    const result = await tx.user.update({
      where: { id: userId },
      data: {
        ...(allowedMenus !== undefined ? { allowedMenus } : {}),
        ...(changes.role ? { role } : {}),
        ...(changes.isActive ? { isActive } : {}),
      },
      select: { id: true, email: true, allowedMenus: true, role: true, isActive: true },
    });

    if (Object.keys(changes).length > 0) {
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "admin.user_update",
          target: userId,
          metadata: { targetEmail: target.email, changes } as Prisma.InputJsonValue,
        },
      });
    }

    return result;
  });

  return NextResponse.json({ user: updated });
}
