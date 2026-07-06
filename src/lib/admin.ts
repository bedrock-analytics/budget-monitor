import type { User } from "@prisma/client";

// Sidebar menu key for the admin-only "Menu Access" item; unrelated to role checks below.
export const ADMIN_MENU_KEY = "admin-menu-access";

export function isAdmin(user: Pick<User, "role">): boolean {
  return user.role === "ADMIN";
}
