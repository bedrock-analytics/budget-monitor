"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ADMIN_MENU_KEY } from "@/lib/admin";
import { getAllMenuKeys } from "@/navigation/sidebar/access";

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  department: string | null;
  allowedMenus: string[];
};

async function fetchUsers(): Promise<AdminUser[]> {
  const res = await fetch("/api/admin/menu-access");
  if (!res.ok) throw new Error("Failed to load users");
  const data = await res.json();
  return data.users;
}

async function updateUserMenus(payload: { userId: string; allowedMenus: string[] }) {
  const res = await fetch("/api/admin/menu-access", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

export default function MenuAccessPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const menuKeys = useMemo(() => getAllMenuKeys(), []);
  const usersQuery = useQuery({ queryKey: ["admin-menu-access"], queryFn: fetchUsers });

  const mutation = useMutation({
    mutationFn: updateUserMenus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-menu-access"] });
      qc.invalidateQueries({ queryKey: ["allowed-menus"] });
      toast.success("Menu access updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!usersQuery.data) return [];
    if (!q) return usersQuery.data;
    return usersQuery.data.filter((u) => u.email.toLowerCase().includes(q) || (u.name ?? "").toLowerCase().includes(q));
  }, [usersQuery.data, search]);

  const toggle = (user: AdminUser, menuKey: string) => {
    const next = user.allowedMenus.includes(menuKey)
      ? user.allowedMenus.filter((k) => k !== menuKey)
      : [...user.allowedMenus, menuKey];
    mutation.mutate({ userId: user.id, allowedMenus: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl">Menu Access</h1>
          <p className="text-muted-foreground text-sm">
            Grant users access to restricted sidebar items. Unrestricted menus are visible to everyone.
          </p>
        </div>
        <Input
          placeholder="Search by email or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-48">User</TableHead>
              {menuKeys.map((m) => (
                <TableHead key={m.key} className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span>{m.title}</span>
                    {m.key === ADMIN_MENU_KEY && (
                      <Badge variant="secondary" className="text-[10px]">
                        admin
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={menuKeys.length + 1}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={menuKeys.length + 1} className="text-center text-muted-foreground">
                  No users
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name ?? "—"}</div>
                    <div className="text-muted-foreground text-xs">{user.email}</div>
                  </TableCell>
                  {menuKeys.map((m) => (
                    <TableCell key={m.key} className="text-center">
                      <Checkbox
                        checked={user.allowedMenus.includes(m.key)}
                        onCheckedChange={() => toggle(user, m.key)}
                        disabled={mutation.isPending}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
