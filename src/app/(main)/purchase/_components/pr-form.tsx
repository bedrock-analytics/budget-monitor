"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Download, Paperclip, Plus, Trash2, Upload } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BudgetOption, PurchaseRequestAttachmentRow, PurchaseRequestRow } from "@/lib/purchase-request";
import { cn } from "@/lib/utils";

const itemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit: z.string().default("EA"),
  unitPrice: z.coerce.number().min(0.01, "Unit price must be greater than 0"),
});

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    department: z.string().optional(),
    currency: z.enum(["THB", "USD"]).default("THB"),
    notes: z.string().optional(),
    dueDate: z.string().optional(),
    deliveryTo: z.string().optional(),
    proposedStrategy: z.enum(["", "CALL_FOR_TENDER", "DIRECT_NEGOTIATION"]).optional(),
    businessJustification: z.string().optional(),
    budgetId: z.string().min(1, "Budget is required"),
    items: z.array(itemSchema).min(1, "At least one item is required"),
  })
  .superRefine((val, ctx) => {
    if (val.proposedStrategy === "DIRECT_NEGOTIATION" && !val.businessJustification?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["businessJustification"],
        message: "Business justification is required for direct negotiation",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface PRFormProps {
  requesterId: string;
  initialData?: PurchaseRequestRow;
}

interface NewAttachment {
  fileName: string;
  fileKey: string;
  fileSize: number;
  contentType: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PRForm({ requesterId, initialData }: PRFormProps) {
  const router = useRouter();
  const [budgetOptions, setBudgetOptions] = useState<BudgetOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState<PurchaseRequestAttachmentRow[]>(
    initialData?.attachments ?? [],
  );
  const [newAttachments, setNewAttachments] = useState<NewAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description || "",
          department: initialData.department || "",
          currency: initialData.currency as "THB" | "USD",
          notes: initialData.notes || "",
          dueDate: initialData.dueDate ? initialData.dueDate.slice(0, 10) : "",
          deliveryTo: initialData.deliveryTo || "",
          proposedStrategy: initialData.proposedStrategy ?? "",
          businessJustification: initialData.businessJustification || "",
          budgetId: initialData.budget?.id ?? "",
          items: initialData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
          })),
        }
      : {
          title: "",
          description: "",
          department: "",
          currency: "THB",
          notes: "",
          dueDate: "",
          deliveryTo: "",
          proposedStrategy: "",
          businessJustification: "",
          budgetId: "",
          items: [
            {
              description: "",
              quantity: 1,
              unit: "EA",
              unitPrice: 0,
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const watchCurrency = form.watch("currency");
  const watchStrategy = form.watch("proposedStrategy");

  const totalAmount = watchItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);

  useEffect(() => {
    fetch("/api/budget/options")
      .then((res) => res.json())
      .then(setBudgetOptions)
      .catch(console.error);
  }, []);

  const formatCurrency = useCallback(
    (value: number) => {
      if (watchCurrency === "USD") {
        return value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      }
      return value.toLocaleString("th-TH", {
        style: "currency",
        currency: "THB",
      });
    },
    [watchCurrency],
  );

  const getBudgetAvailable = useCallback(
    (budgetId: string) => {
      const budget = budgetOptions.find((b) => b.id === budgetId);
      if (!budget) return null;
      return watchCurrency === "USD" ? budget.availableUSD : budget.availableTHB;
    },
    [budgetOptions, watchCurrency],
  );

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          alert(`${file.name} exceeds 25 MB limit`);
          continue;
        }

        const presignRes = await fetch("/api/purchase-request/attachments/presign-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            fileSize: file.size,
          }),
        });

        if (!presignRes.ok) {
          const err = await presignRes.json();
          alert(err.error || `Failed to prepare upload for ${file.name}`);
          continue;
        }

        const { uploadUrl, fileKey } = await presignRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });

        if (!uploadRes.ok) {
          alert(`Failed to upload ${file.name}`);
          continue;
        }

        setNewAttachments((prev) => [
          ...prev,
          {
            fileName: file.name,
            fileKey,
            fileSize: file.size,
            contentType: file.type || "application/octet-stream",
          },
        ]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeNewAttachment = (fileKey: string) => {
    setNewAttachments((prev) => prev.filter((a) => a.fileKey !== fileKey));
  };

  const removeExistingAttachment = async (id: string) => {
    if (!confirm("Delete this attachment?")) return;
    const res = await fetch(`/api/purchase-request/attachments/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Failed to delete attachment");
      return;
    }
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const downloadExistingAttachment = async (id: string) => {
    const res = await fetch(`/api/purchase-request/attachments/${id}`);
    if (!res.ok) {
      alert("Failed to get download link");
      return;
    }
    const { downloadUrl } = await res.json();
    window.open(downloadUrl, "_blank");
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const url = initialData ? `/api/purchase-request/${initialData.id}` : "/api/purchase-request";
      const method = initialData ? "PUT" : "POST";

      const payload = initialData
        ? { ...values, requesterId, newAttachments }
        : { ...values, requesterId, attachments: newAttachments };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      router.push("/purchase");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save purchase request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5 sm:col-span-2" data-invalid={fieldState.invalid}>
                  <FieldLabel>Title</FieldLabel>
                  <Input {...field} placeholder="e.g. Office supplies for Q2" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="department"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel>Department</FieldLabel>
                  <Input {...field} placeholder="e.g. Engineering" />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="currency"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel>Currency</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel>Due Date</FieldLabel>
                  <Input {...field} type="date" />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="deliveryTo"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel>Delivery To</FieldLabel>
                  <Input {...field} placeholder="e.g. HQ Bangkok, Warehouse 2" />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="budgetId"
              render={({ field, fieldState }) => {
                const available = field.value ? getBudgetAvailable(field.value) : null;
                const selected = budgetOptions.find((b) => b.id === field.value);
                return (
                  <Field className="gap-1.5 sm:col-span-2" data-invalid={fieldState.invalid}>
                    <FieldLabel>Budget Line</FieldLabel>
                    <Popover open={budgetOpen} onOpenChange={setBudgetOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={budgetOpen}
                          className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                        >
                          <span className="truncate">
                            {selected ? `${selected.projectTypeName} - ${selected.budgetItemName}` : "Select budget..."}
                          </span>
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput placeholder="Search budget..." />
                          <CommandList>
                            <CommandEmpty>No budget found.</CommandEmpty>
                            <CommandGroup>
                              {budgetOptions.map((b) => {
                                const isSelected = b.id === field.value;
                                const availableLabel =
                                  watchCurrency === "USD"
                                    ? `$${b.availableUSD.toLocaleString()}`
                                    : `฿${b.availableTHB.toLocaleString()}`;
                                return (
                                  <CommandItem
                                    key={b.id}
                                    value={`${b.projectTypeName} ${b.budgetItemName}`}
                                    data-checked={isSelected}
                                    onSelect={() => {
                                      field.onChange(b.id);
                                      setBudgetOpen(false);
                                    }}
                                  >
                                    <div className="flex min-w-0 flex-1 flex-col">
                                      <span className="truncate">
                                        {b.projectTypeName} - {b.budgetItemName}
                                      </span>
                                      <span className="text-muted-foreground text-xs">{availableLabel} available</span>
                                    </div>
                                    <Check
                                      className={cn("ml-2 size-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")}
                                    />
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {available !== null && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Available budget:</span>
                        <Badge variant={available >= totalAmount ? "outline" : "destructive"}>
                          {formatCurrency(available)}
                        </Badge>
                        {available < totalAmount && <span className="text-destructive">Exceeds available budget!</span>}
                      </div>
                    )}
                  </Field>
                );
              }}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <Textarea {...field} placeholder="Additional details..." rows={3} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="proposedStrategy"
              render={({ field }) => (
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel>Proposed Strategy</FieldLabel>
                  <Select value={field.value || ""} onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      <SelectItem value="CALL_FOR_TENDER">Call for Tender</SelectItem>
                      <SelectItem value="DIRECT_NEGOTIATION">Direct Negotiation</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {watchStrategy === "DIRECT_NEGOTIATION" && (
              <Controller
                control={form.control}
                name="businessJustification"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5 sm:col-span-2" data-invalid={fieldState.invalid}>
                    <FieldLabel>Business Justification</FieldLabel>
                    <Textarea {...field} placeholder="Explain why direct negotiation is required..." rows={3} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            )}

            <Controller
              control={form.control}
              name="notes"
              render={({ field }) => (
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea {...field} placeholder="Internal notes..." rows={2} />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Attachments</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload data-icon="inline-start" />
            {uploading ? "Uploading..." : "Attach Files"}
          </Button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {existingAttachments.length === 0 && newAttachments.length === 0 && (
            <p className="text-muted-foreground text-sm">No attachments. Max 25 MB per file.</p>
          )}
          {existingAttachments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{a.fileName}</span>
                <Badge variant="outline">{formatFileSize(a.fileSize)}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => downloadExistingAttachment(a.id)}
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  onClick={() => removeExistingAttachment(a.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {newAttachments.map((a) => (
            <div key={a.fileKey} className="flex items-center justify-between rounded-md border border-dashed p-3">
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{a.fileName}</span>
                <Badge variant="outline">{formatFileSize(a.fileSize)}</Badge>
                <Badge>Pending</Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                onClick={() => removeNewAttachment(a.fileKey)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Line Items with Budget Integration */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                description: "",
                quantity: 1,
                unit: "EA",
                unitPrice: 0,
              })
            }
          >
            <Plus data-icon="inline-start" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {fields.map((field, index) => {
            const itemTotal = (watchItems[index]?.quantity || 0) * (watchItems[index]?.unitPrice || 0);

            return (
              <div key={field.id} className="rounded-lg border p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Item {index + 1}</span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Description */}
                  <Controller
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field: f, fieldState }) => (
                      <Field className="gap-1.5 sm:col-span-2" data-invalid={fieldState.invalid}>
                        <FieldLabel>Description</FieldLabel>
                        <Input {...f} placeholder="Item description..." />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* Quantity */}
                  <Controller
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field: f, fieldState }) => (
                      <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                        <FieldLabel>Quantity</FieldLabel>
                        <Input {...f} type="number" min={1} onChange={(e) => f.onChange(Number(e.target.value))} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* Unit */}
                  <Controller
                    control={form.control}
                    name={`items.${index}.unit`}
                    render={({ field: f }) => (
                      <Field className="gap-1.5">
                        <FieldLabel>Unit</FieldLabel>
                        <Select value={f.value} onValueChange={f.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EA">EA (Each)</SelectItem>
                            <SelectItem value="SET">SET</SelectItem>
                            <SelectItem value="BOX">BOX</SelectItem>
                            <SelectItem value="LOT">LOT</SelectItem>
                            <SelectItem value="HR">HR (Hour)</SelectItem>
                            <SelectItem value="DAY">DAY</SelectItem>
                            <SelectItem value="MTH">MTH (Month)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />

                  {/* Unit Price */}
                  <Controller
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field: f, fieldState }) => (
                      <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                        <FieldLabel>Unit Price</FieldLabel>
                        <Input
                          {...f}
                          type="number"
                          min={0}
                          step={0.01}
                          onChange={(e) => f.onChange(Number(e.target.value))}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* Line Total */}
                  <Field className="gap-1.5">
                    <FieldLabel>Line Total</FieldLabel>
                    <div className="flex h-9 items-center rounded-md bg-muted px-3 text-sm font-medium">
                      {formatCurrency(itemTotal)}
                    </div>
                  </Field>
                </div>
              </div>
            );
          })}

          {form.formState.errors.items?.root && (
            <p className="text-destructive text-sm">{form.formState.errors.items.root.message}</p>
          )}

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <span className="font-semibold text-lg">Total Amount</span>
            <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/purchase")}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Update Request" : "Create Request"}
        </Button>
      </div>
    </form>
  );
}
