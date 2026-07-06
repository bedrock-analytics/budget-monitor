"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ImportDialog, type ImportMode } from "@/components/import/import-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllowedMenus } from "@/hooks/use-allowed-menus";

interface ProviderInfo {
  key: string;
  label: string;
  description: string | null;
  minRole: "MANAGER" | "ADMIN";
  accepts: string[];
  supportsReplace: boolean;
  canClear: boolean;
  count: number;
  keys: string[] | null;
  lastImport: { actor: string; at: string } | null;
}

interface HistoryEntry {
  id: string;
  actor: string;
  action: string;
  target: string | null;
  createdAt: string;
}

interface DataRegistryResponse {
  providers: ProviderInfo[];
  history: HistoryEntry[];
}

interface GenericPreview {
  errors: string[];
  rowCount?: number;
  currentCount?: number;
}

interface GenericResult {
  imported?: number;
}

async function fetchRegistry(): Promise<DataRegistryResponse> {
  const res = await fetch("/api/admin/data");
  if (!res.ok) throw new Error("Failed to load datasets");
  return res.json();
}

async function fetchSample(key: string): Promise<unknown[]> {
  const res = await fetch(`/api/admin/data/${key}/sample?limit=20`);
  if (!res.ok) throw new Error("Failed to load sample");
  const data = await res.json();
  return data.rows;
}

async function clearDataset(key: string) {
  const res = await fetch(`/api/admin/data/${key}`, { method: "DELETE" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Failed to clear dataset");
  return data;
}

function renderGenericSummary(preview: GenericPreview, mode: ImportMode) {
  const rowCount = preview.rowCount ?? 0;
  const currentCount = preview.currentCount ?? 0;
  return (
    <div className="flex flex-col gap-1">
      <span>{rowCount} rows in file</span>
      <span className="text-muted-foreground">
        {mode === "replace"
          ? `Replaces all ${currentCount} current rows.`
          : `Adds to the ${currentCount} rows already in this dataset.`}
      </span>
    </div>
  );
}

function renderGenericResult(result: GenericResult) {
  return <span>Imported {result.imported ?? 0} rows.</span>;
}

function SampleDialog({ providerKey, label }: { providerKey: string; label: string }) {
  const [open, setOpen] = useState(false);
  const sampleQuery = useQuery({
    queryKey: ["data-registry-sample", providerKey],
    queryFn: () => fetchSample(providerKey),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View sample
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{label} — sample rows</DialogTitle>
          <DialogDescription>The 20 most recently updated rows.</DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-auto rounded-md border">
          {sampleQuery.isLoading ? (
            <div className="p-4">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-all p-3 text-xs">
              {JSON.stringify(sampleQuery.data ?? [], null, 2)}
            </pre>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const CLEAR_CONFIRM_PHRASE = "CLEAR";

function ClearDatasetDialog({
  providerKey,
  label,
  count,
  onCleared,
}: {
  providerKey: string;
  label: string;
  count: number;
  onCleared: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const mutation = useMutation({
    mutationFn: () => clearDataset(providerKey),
    onSuccess: () => {
      toast.success(`${label} cleared`);
      setOpen(false);
      setConfirmText("");
      onCleared();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmText("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Clear
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clear {label}</DialogTitle>
          <DialogDescription>
            This permanently deletes all {count} rows in this dataset. This cannot be undone. Type{" "}
            {CLEAR_CONFIRM_PHRASE} to confirm.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={CLEAR_CONFIRM_PHRASE}
          disabled={mutation.isPending}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmText !== CLEAR_CONFIRM_PHRASE || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Clearing..." : "Clear dataset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DataManagementPage() {
  const qc = useQueryClient();
  const { data: allowedMenus } = useAllowedMenus();
  const [historyFilter, setHistoryFilter] = useState("");

  const registryQuery = useQuery({ queryKey: ["data-registry"], queryFn: fetchRegistry });

  const isAdmin = allowedMenus?.isAdmin ?? false;
  const canManage = allowedMenus?.canManage ?? false;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["data-registry"] });

  const filteredHistory = useMemo(() => {
    const q = historyFilter.trim().toLowerCase();
    const history = registryQuery.data?.history ?? [];
    if (!q) return history;
    return history.filter(
      (h) =>
        h.actor.toLowerCase().includes(q) ||
        (h.target ?? "").toLowerCase().includes(q) ||
        h.action.toLowerCase().includes(q),
    );
  }, [registryQuery.data?.history, historyFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl">Data Management</h1>
        <p className="text-muted-foreground text-sm">
          Import, preview, and manage every dataset the system tracks. Adding a new dataset only requires registering
          one provider — this page never needs to change.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dataset</TableHead>
              <TableHead className="text-right">Rows</TableHead>
              <TableHead>Last imported</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registryQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : registryQuery.data?.providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No datasets registered
                </TableCell>
              </TableRow>
            ) : (
              registryQuery.data?.providers.map((provider) => {
                const canImport = provider.minRole === "ADMIN" ? isAdmin : canManage;
                const acceptAttr = provider.accepts.map((ext) => `.${ext}`).join(",");
                return (
                  <TableRow key={provider.key}>
                    <TableCell>
                      <div className="font-medium">{provider.label}</div>
                      {provider.description && (
                        <div className="text-muted-foreground text-xs">{provider.description}</div>
                      )}
                      {provider.keys && (
                        <div className="text-muted-foreground text-xs">{provider.keys.length} tracked keys</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{provider.count.toLocaleString()}</TableCell>
                    <TableCell>
                      {provider.lastImport ? (
                        <span className="text-sm">
                          {provider.lastImport.actor} on {new Date(provider.lastImport.at).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <SampleDialog providerKey={provider.key} label={provider.label} />
                        {canImport && (
                          <ImportDialog
                            triggerLabel="Import"
                            title={`Import ${provider.label}`}
                            description={`Preview the file before committing it to ${provider.label}.`}
                            endpoint={`/api/admin/data/${provider.key}/import`}
                            accept={acceptAttr}
                            supportsReplace={provider.supportsReplace}
                            canReplace={isAdmin}
                            onImported={invalidate}
                            renderSummary={renderGenericSummary}
                            renderResult={renderGenericResult}
                          />
                        )}
                        {isAdmin && provider.canClear && (
                          <ClearDatasetDialog
                            providerKey={provider.key}
                            label={provider.label}
                            count={provider.count}
                            onCleared={invalidate}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-lg">Import history</h2>
          <Input
            placeholder="Filter by dataset, actor, or action"
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Dataset</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No history yet
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-sm">{new Date(h.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{h.target ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{h.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{h.actor}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
