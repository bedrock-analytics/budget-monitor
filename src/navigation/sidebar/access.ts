import { type NavGroup, type NavMainItem, type NavSubItem, sidebarItems } from "./sidebar-items";

export function hasMenuAccess(
  item: Pick<NavMainItem | NavSubItem, "key" | "restricted">,
  allowedMenus?: string[] | null,
  isAdminUser = false,
): boolean {
  if (isAdminUser) return true;
  if (!item.restricted) return true;
  if (!item.key) return true;
  if (!allowedMenus || allowedMenus.length === 0) return false;
  return allowedMenus.includes(item.key);
}

export function filterSidebarByMenus(
  groups: readonly NavGroup[],
  allowedMenus?: string[] | null,
  isAdminUser = false,
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => hasMenuAccess(item, allowedMenus, isAdminUser))
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter((sub) => hasMenuAccess(sub, allowedMenus, isAdminUser)),
        })),
    }))
    .filter((group) => group.dynamicChats || group.items.length > 0);
}

export function findItemByPath(path: string): NavMainItem | NavSubItem | null {
  for (const group of sidebarItems) {
    for (const item of group.items) {
      if (item.subItems) {
        const sub = item.subItems.find((s) => path === s.url || path.startsWith(`${s.url}/`));
        if (sub) return sub;
      }
      if (path === item.url || path.startsWith(`${item.url}/`)) return item;
    }
  }
  return null;
}

// Trees that must default-deny when a path isn't found in sidebarItems, instead of
// failing open -- covers admin pages added under /admin/* before they're registered
// (or ever, if forgotten). Everything outside these prefixes keeps the legacy
// allow-unless-restricted behavior since most routes intentionally aren't in the sidebar.
const RESTRICTED_PATH_PREFIXES = ["/admin", "/data-management"];

function isUnderRestrictedTree(path: string): boolean {
  return RESTRICTED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isPathAllowed(path: string, allowedMenus?: string[] | null, isAdminUser = false): boolean {
  if (isAdminUser) return true;
  const item = findItemByPath(path);
  if (!item) return !isUnderRestrictedTree(path);
  return hasMenuAccess(item, allowedMenus, isAdminUser);
}

export function getAllMenuKeys(): { key: string; title: string }[] {
  const out: { key: string; title: string }[] = [];
  for (const group of sidebarItems) {
    for (const item of group.items) {
      if (item.key) out.push({ key: item.key, title: item.title });
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.key) out.push({ key: sub.key, title: `${item.title} / ${sub.title}` });
        }
      }
    }
  }
  return out;
}
