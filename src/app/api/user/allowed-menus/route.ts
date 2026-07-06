import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { hasRole } from "@/lib/authz";

// Restricted sidebar keys granted to every MANAGER+ regardless of their allowedMenus row --
// mirrors the isAdminUser short-circuit in access.ts, but scoped to specific keys instead of
// all restricted items, so it doesn't also expose ADMIN-only items (e.g. Menu Access) to MANAGER.
const MANAGER_MENU_KEYS = ["data-management"];

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canManage = hasRole(user, "MANAGER");
  const allowedMenus = canManage
    ? Array.from(new Set([...user.allowedMenus, ...MANAGER_MENU_KEYS]))
    : user.allowedMenus;

  return NextResponse.json({
    allowedMenus,
    isAdmin: isAdmin(user),
    canManage,
  });
}
