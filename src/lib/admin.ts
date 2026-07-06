import type { User } from "@prisma/client";

export const ADMIN_MENU_KEY = "admin-menu-access";

// TODO(M8): drop the allowedMenus fallback once all admins are migrated to role=ADMIN.
export function isAdmin(user: Pick<User, "role" | "allowedMenus">): boolean {
  return user.role === "ADMIN" || user.allowedMenus.includes(ADMIN_MENU_KEY);
}
