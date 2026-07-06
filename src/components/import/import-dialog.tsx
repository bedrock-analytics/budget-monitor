"use client";

import { type ReactNode, useRef, useState } from "react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ImportMode = "upsert" | "replace";

// biome-ignore lint/suspicious/noExplicitAny: dry-run/commit response shapes are dataset-specific
type DryRunResult = { errors: string[] } & Record<string, any>;
// biome-ignore lint/suspicious/noExplicitAny: dry-run/commit response shapes are dataset-specific
type ImportResult = Record<string, any>;

const REPLACE_CONFIRM_PHRASE = "REPLACE";

interface ImportDialogProps {
  triggerLabel: string;
  title: string;
  description: string;
  endpoint: string;
  accept: string;
  supportsReplace: boolean;
  canReplace: boolean;
  onImported?: () => void;
  renderSummary: (preview: DryRunResult, mode: ImportMode) => ReactNode;
  renderResult: (result: ImportResult) => ReactNode;
}

export function ImportDialog({
  triggerLabel,
  title,
  description,
  endpoint,
  accept,
  supportsReplace,
  canReplace,
  onImported,
  renderSummary,
  renderResult,
}: ImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>("upsert");
  const [confirmText, setConfirmText] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<DryRunResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setMode("upsert");
    setConfirmText("");
    setPreviewing(false);
    setPreview(null);
    setPreviewError(null);
    setSubmitting(false);
    setResult(null);
    setSubmitError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const runPreview = async (selectedFile: File, selectedMode: ImportMode) => {
    setPreviewing(true);
    setPreview(null);
    setPreviewError(null);
    setResult(null);
    setSubmitError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    const query = supportsReplace ? `?dryRun=1&mode=${selectedMode}` : "?dryRun=1";

    try {
      const res = await fetch(`${endpoint}${query}`, { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setPreviewError(data?.error ?? "Preview failed");
      } else {
        setPreview({ ...data, errors: data.errors ?? [] });
      }
    } catch {
      setPreviewError("Network error");
    } finally {
      setPreviewing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    runPreview(selected, mode);
  };

  const handleModeChange = (nextMode: ImportMode) => {
    setMode(nextMode);
    setConfirmText("");
  };

  const handleConfirm = async () => {
    if (!file) return;
    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append("file", file);
    const query = supportsReplace ? `?mode=${mode}` : "";

    try {
      const res = await fetch(`${endpoint}${query}`, { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setSubmitError(data?.error ?? "Import failed");
      } else {
        setResult(data);
        onImported?.();
      }
    } catch {
      setSubmitError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const closeAndReset = () => {
    setOpen(false);
    reset();
  };

  const requiresTypedConfirmation = supportsReplace && mode === "replace";
  const canConfirm =
    !!preview &&
    preview.errors.length === 0 &&
    !submitting &&
    !result &&
    (!requiresTypedConfirmation || confirmText === REPLACE_CONFIRM_PHRASE);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setOpen(next);
        else closeAndReset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!file && (
            <div>
              <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFileChange} />
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                Choose file
              </Button>
            </div>
          )}

          {file && (
            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="truncate">{file.name}</span>
              {!submitting && !result && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  Change file
                </Button>
              )}
            </div>
          )}

          {supportsReplace && file && !result && (
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-sm">Import mode</span>
              <Select value={mode} onValueChange={(v) => handleModeChange(v as ImportMode)} disabled={submitting}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upsert">Add to existing data</SelectItem>
                  <SelectItem value="replace" disabled={!canReplace}>
                    Replace all existing data {!canReplace && "(admin only)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {previewing && <p className="text-muted-foreground text-sm">Validating file...</p>}

          {previewError && <p className="text-destructive text-sm">{previewError}</p>}

          {preview && !result && (
            <div className="flex flex-col gap-3 rounded-md border p-3 text-sm">
              {renderSummary(preview, mode)}
              {preview.errors.length > 0 && (
                <div className="flex flex-col gap-1 rounded-md bg-destructive/10 p-2">
                  <span className="font-medium text-destructive">
                    {preview.errors.length} validation {preview.errors.length === 1 ? "error" : "errors"} -- fix the
                    file and re-upload
                  </span>
                  <ul className="max-h-32 list-disc overflow-y-auto pl-4 text-destructive">
                    {preview.errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {requiresTypedConfirmation && preview && preview.errors.length === 0 && !result && (
            <div className="flex flex-col gap-1.5 rounded-md border border-destructive/50 p-3">
              <span className="text-destructive text-sm">
                This replaces existing data and cannot be undone. Type {REPLACE_CONFIRM_PHRASE} to confirm.
              </span>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={REPLACE_CONFIRM_PHRASE}
                disabled={submitting}
              />
            </div>
          )}

          {submitError && <p className="text-destructive text-sm">{submitError}</p>}

          {result && <div className="rounded-md border border-green-600/50 p-3 text-sm">{renderResult(result)}</div>}
        </div>

        <DialogFooter>
          {result ? (
            <Button onClick={closeAndReset}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={closeAndReset}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!canConfirm}>
                {submitting ? "Importing..." : "Confirm Import"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
