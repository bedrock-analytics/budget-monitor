import { NextResponse } from "next/server";

import { z } from "zod";

import { isAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, department: true, allowedMenus: true },
    orderBy: { email: "asc" },
  });
  return NextResponse.json({ users });
}

const UpdateSchema = z.object({
  userId: z.string().min(1),
  allowedMenus: z.array(z.string().min(1)),
});

export async function PUT(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = UpdateSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const updated = await db.user.update({
    where: { id: body.data.userId },
    data: { allowedMenus: body.data.allowedMenus },
    select: { id: true, email: true, allowedMenus: true },
  });
  return NextResponse.json({ user: updated });
}
