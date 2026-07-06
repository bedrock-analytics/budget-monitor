import { useQuery } from "@tanstack/react-query";

interface AllowedMenusResponse {
  allowedMenus: string[];
  isAdmin: boolean;
  canManage: boolean;
}

async function fetchAllowedMenus(): Promise<AllowedMenusResponse> {
  const res = await fetch("/api/user/allowed-menus");
  if (!res.ok) throw new Error("Failed to fetch allowed menus");
  const data = await res.json();
  return { allowedMenus: data.allowedMenus ?? [], isAdmin: data.isAdmin ?? false, canManage: data.canManage ?? false };
}

export function useAllowedMenus(enabled = true) {
  return useQuery({
    queryKey: ["allowed-menus"],
    queryFn: fetchAllowedMenus,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
