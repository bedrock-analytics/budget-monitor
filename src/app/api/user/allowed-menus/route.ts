import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ allowedMenus: user.allowedMenus, isAdmin: isAdmin(user) });
}
