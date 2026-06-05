import type { User } from "@prisma/client";

export const ADMIN_MENU_KEY = "admin-menu-access";

export function isAdmin(user: Pick<User, "allowedMenus">): boolean {
  return user.allowedMenus.includes(ADMIN_MENU_KEY);
}
