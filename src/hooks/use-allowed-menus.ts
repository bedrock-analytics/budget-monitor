import { useQuery } from "@tanstack/react-query";

async function fetchAllowedMenus(): Promise<string[]> {
  const res = await fetch("/api/user/allowed-menus");
  if (!res.ok) throw new Error("Failed to fetch allowed menus");
  const data = await res.json();
  return data.allowedMenus ?? [];
}

export function useAllowedMenus(enabled = true) {
  return useQuery({
    queryKey: ["allowed-menus"],
    queryFn: fetchAllowedMenus,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
