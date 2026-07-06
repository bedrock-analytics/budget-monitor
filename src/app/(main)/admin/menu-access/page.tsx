"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ADMIN_MENU_KEY } from "@/lib/admin";
import { getAllMenuKeys } from "@/navigation/sidebar/access";

type UserRole = "ADMIN" | "MANAGER" | "USER";

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  department: string | null;
  allowedMenus: string[];
  role: UserRole;
  isActive: boolean;
};

type UpdateUserPayload = {
  userId: string;
  allowedMenus?: string[];
  role?: UserRole;
  isActive?: boolean;
};

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "MANAGER", "USER"];

async function fetchUsers(): Promise<AdminUser[]> {
  const res = await fetch("/api/admin/menu-access");
  if (!res.ok) throw new Error("Failed to load users");
  const data = await res.json();
  return data.users;
}

async function updateUser(payload: UpdateUserPayload) {
  const res = await fetch("/api/admin/menu-access", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Failed to update");
  return data;
}

export default function MenuAccessPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const menuKeys = useMemo(() => getAllMenuKeys(), []);
  const usersQuery = useQuery({ queryKey: ["admin-menu-access"], queryFn: fetchUsers });

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-menu-access"] });
      qc.invalidateQueries({ queryKey: ["allowed-menus"] });
      toast.success("User updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!usersQuery.data) return [];
    if (!q) return usersQuery.data;
    return usersQuery.data.filter((u) => u.email.toLowerCase().includes(q) || (u.name ?? "").toLowerCase().includes(q));
  }, [usersQuery.data, search]);

  const toggleMenu = (user: AdminUser, menuKey: string) => {
    const next = user.allowedMenus.includes(menuKey)
      ? user.allowedMenus.filter((k) => k !== menuKey)
      : [...user.allowedMenus, menuKey];
    mutation.mutate({ userId: user.id, allowedMenus: next });
  };

  const changeRole = (user: AdminUser, role: UserRole) => {
    if (role === user.role) return;
    mutation.mutate({ userId: user.id, role });
  };

  const toggleActive = (user: AdminUser, isActive: boolean) => {
    mutation.mutate({ userId: user.id, isActive });
  };

  const columnCount = menuKeys.length + 3;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl">Menu Access</h1>
          <p className="text-muted-foreground text-sm">
            Manage user roles, active status, and access to restricted sidebar items. Unrestricted menus are visible to
            everyone.
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
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Active</TableHead>
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
                  <TableCell colSpan={columnCount}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
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
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => changeRole(user, value as UserRole)}
                      disabled={mutation.isPending}
                    >
                      <SelectTrigger size="sm" className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={(checked) => toggleActive(user, checked)}
                      disabled={mutation.isPending}
                    />
                  </TableCell>
                  {menuKeys.map((m) => (
                    <TableCell key={m.key} className="text-center">
                      <Checkbox
                        checked={user.allowedMenus.includes(m.key)}
                        onCheckedChange={() => toggleMenu(user, m.key)}
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
