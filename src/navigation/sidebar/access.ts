import { type NavGroup, type NavMainItem, type NavSubItem, sidebarItems } from "./sidebar-items";

export function hasMenuAccess(
  item: Pick<NavMainItem | NavSubItem, "key" | "restricted">,
  allowedMenus?: string[] | null,
): boolean {
  if (!item.restricted) return true;
  if (!item.key) return true;
  if (!allowedMenus || allowedMenus.length === 0) return false;
  return allowedMenus.includes(item.key);
}

export function filterSidebarByMenus(groups: readonly NavGroup[], allowedMenus?: string[] | null): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => hasMenuAccess(item, allowedMenus))
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter((sub) => hasMenuAccess(sub, allowedMenus)),
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

export function isPathAllowed(path: string, allowedMenus?: string[] | null): boolean {
  const item = findItemByPath(path);
  if (!item) return true;
  return hasMenuAccess(item, allowedMenus);
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
