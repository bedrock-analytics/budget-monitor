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
import { Checkbox } from "@/components/ui/checkbox";
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

const biddingVendorSchema = z.object({
  vendorName: z.string().min(1, "Vendor name is required"),
  contact: z.string().optional(),
  note: z.string().optional(),
});

const JUSTIFICATION_REASONS = [
  { id: 1, label: "Not worth for bidding" },
  {
    id: 2,
    label: "Lack of sufficient qualified bidder and/or absence of competitive market",
  },
  { id: 3, label: "Emergency requirement" },
  { id: 4, label: "Bidding cancellation" },
  { id: 5, label: "Special Qualification" },
  { id: 6, label: "Procurement from PTT Group of Companies" },
  { id: 7, label: "Proprietary requirement/ Warranty condition" },
  { id: 8, label: "Others which provide best benefit to th company" },
] as const;

const TITLE_PREFIXES = ["Supply of", "Provision of"] as const;

type TitlePrefix = (typeof TITLE_PREFIXES)[number];

function splitTitle(value: string): { prefix: TitlePrefix; rest: string } {
  for (const prefix of TITLE_PREFIXES) {
    if (value.startsWith(`${prefix} `)) {
      return { prefix, rest: value.slice(prefix.length + 1) };
    }
    if (value === prefix) {
      return { prefix, rest: "" };
    }
  }
  return { prefix: "Supply of", rest: value };
}

const JUSTIFICATION_REMARKS = [
  "Purchase from Manufacturer Authorized Supplier (Single Source) - Justification No.5",
  "Continue work from previous PO: (Please Identify PO No.) - Justification No.8",
  "Other reason (Put explanation) - Justification No.8",
  "Emergency Work - Justification No.3",
] as const;

const formSchema = z
  .object({
    orderType: z.enum(["PURCHASE_ORDER", "SERVICE_ORDER"]).default("PURCHASE_ORDER"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    department: z.string().optional(),
    currency: z.enum(["THB", "USD"]).default("THB"),
    notes: z.string().optional(),
    dueDate: z.string().optional(),
    deliveryTo: z.string().optional(),
    proposedStrategy: z.enum(["CALL_FOR_TENDER", "DIRECT_NEGOTIATION"]).optional(),
    justificationReasons: z.array(z.number()).default([]),
    businessJustification: z.string().min(1, "Explanation is required"),
    biddingVendors: z.array(biddingVendorSchema).default([]),
    budgetId: z.string().min(1, "Budget is required"),
    items: z.array(itemSchema).min(1, "At least one item is required"),
  })
  .superRefine((val, ctx) => {
    if (!val.proposedStrategy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["proposedStrategy"],
        message: "Select a strategy",
      });
    }
    if (val.proposedStrategy === "DIRECT_NEGOTIATION") {
      if (val.justificationReasons.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["justificationReasons"],
          message: "Select at least one justification",
        });
      }
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

const STEPS = [
  {
    key: "details",
    label: "Request Details",
    fields: [
      "orderType",
      "title",
      "description",
      "department",
      "currency",
      "notes",
      "dueDate",
      "deliveryTo",
      "budgetId",
    ] as const,
  },
  {
    key: "justification",
    label: "Business Justification",
    fields: ["proposedStrategy", "justificationReasons", "businessJustification", "biddingVendors"] as const,
  },
  { key: "attachments", label: "Attachments", fields: [] as const },
  { key: "items", label: "Line Items", fields: ["items"] as const },
] as const;

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
  const [currentStep, setCurrentStep] = useState(0);
  const [savedVendorNames, setSavedVendorNames] = useState<string[]>([]);
  const [savedContacts, setSavedContacts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          orderType: initialData.orderType,
          title: initialData.title,
          description: initialData.description || "",
          department: initialData.department || "",
          currency: initialData.currency as "THB" | "USD",
          notes: initialData.notes || "",
          dueDate: initialData.dueDate ? initialData.dueDate.slice(0, 10) : "",
          deliveryTo: initialData.deliveryTo || "",
          proposedStrategy: initialData.proposedStrategy || undefined,
          justificationReasons: (initialData as { justificationReasons?: number[] }).justificationReasons ?? [],
          businessJustification: initialData.businessJustification || "",
          biddingVendors:
            (
              initialData as {
                biddingVendors?: {
                  vendorName: string;
                  contact?: string | null;
                  note?: string | null;
                }[];
              }
            ).biddingVendors?.map((v) => ({
              vendorName: v.vendorName,
              contact: v.contact ?? "",
              note: v.note ?? "",
            })) ?? [],
          budgetId: initialData.budget?.id ?? "",
          items: initialData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
          })),
        }
      : {
          orderType: "PURCHASE_ORDER",
          title: "",
          description: "",
          department: "",
          currency: "THB",
          notes: "",
          dueDate: "",
          deliveryTo: "",
          proposedStrategy: undefined,
          justificationReasons: [],
          businessJustification: "",
          biddingVendors: [],
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

  const {
    fields: vendorFields,
    append: appendVendor,
    remove: removeVendor,
  } = useFieldArray({
    control: form.control,
    name: "biddingVendors",
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

  useEffect(() => {
    try {
      const names = JSON.parse(localStorage.getItem("pr:vendorNames") ?? "[]");
      const contacts = JSON.parse(localStorage.getItem("pr:vendorContacts") ?? "[]");
      if (Array.isArray(names)) setSavedVendorNames(names);
      if (Array.isArray(contacts)) setSavedContacts(contacts);
    } catch {
      // ignore malformed storage
    }
  }, []);

  const saveVendorName = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setSavedVendorNames((prev) => {
      if (prev.includes(v)) return prev;
      const next = [...prev, v];
      localStorage.setItem("pr:vendorNames", JSON.stringify(next));
      return next;
    });
  };

  const saveContact = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setSavedContacts((prev) => {
      if (prev.includes(v)) return prev;
      const next = [...prev, v];
      localStorage.setItem("pr:vendorContacts", JSON.stringify(next));
      return next;
    });
  };

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

  const goNext = async () => {
    const step = STEPS[currentStep];
    if (step.fields.length > 0) {
      const valid = await form.trigger(step.fields as unknown as Parameters<typeof form.trigger>[0]);
      if (!valid) return;
    }
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Stepper */}
      <nav aria-label="Progress">
        <ol className="flex items-center gap-2 sm:gap-4">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <li key={step.key} className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border font-medium text-sm",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {isCompleted ? <Check className="size-4" /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      "hidden font-medium text-sm sm:inline",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn("h-px flex-1", isCompleted ? "bg-primary" : "bg-muted-foreground/30")} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step 1: Header Info */}
      <Card className={cn(currentStep !== 0 && "hidden")}>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="orderType"
              render={({ field }) => (
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel>Order Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE_ORDER">Purchase order</SelectItem>
                      <SelectItem value="SERVICE_ORDER">Service order</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => {
                const { prefix, rest } = splitTitle(field.value || "");
                return (
                  <Field className="gap-1.5 sm:col-span-2" data-invalid={fieldState.invalid}>
                    <FieldLabel>Title</FieldLabel>
                    <div className="flex gap-2">
                      <Select value={prefix} onValueChange={(v) => field.onChange(rest ? `${v} ${rest}` : v)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TITLE_PREFIXES.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={rest}
                        onChange={(e) => field.onChange(e.target.value ? `${prefix} ${e.target.value}` : prefix)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        placeholder="e.g. Office supplies for Q2"
                        className="flex-1"
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                );
              }}
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
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Step 2: Business Justification */}
      <Card className={cn(currentStep !== 1 && "hidden")}>
        <CardHeader>
          <CardTitle>Business Justification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Controller
            control={form.control}
            name="proposedStrategy"
            render={({ field, fieldState }) => (
              <Field className="gap-3" data-invalid={fieldState.invalid}>
                <FieldLabel>Proposed Strategy</FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      className="size-4"
                      value="CALL_FOR_TENDER"
                      checked={field.value === "CALL_FOR_TENDER"}
                      onChange={() => field.onChange("CALL_FOR_TENDER")}
                    />
                    Call for Tender
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      className="size-4"
                      value="DIRECT_NEGOTIATION"
                      checked={field.value === "DIRECT_NEGOTIATION"}
                      onChange={() => field.onChange("DIRECT_NEGOTIATION")}
                    />
                    Direct Negotiation
                  </label>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="businessJustification"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel>Explanation</FieldLabel>
                <Textarea {...field} placeholder="Provide explanation..." rows={3} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          {watchStrategy === "DIRECT_NEGOTIATION" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Controller
                control={form.control}
                name="justificationReasons"
                render={({ field, fieldState }) => (
                  <Field className="gap-3" data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Justification{" "}
                      <span className="font-normal text-muted-foreground text-xs">
                        * Refer to procurement Regulation
                      </span>
                    </FieldLabel>
                    <div className="flex flex-col gap-2">
                      {JUSTIFICATION_REASONS.map((reason) => {
                        const checked = field.value?.includes(reason.id) ?? false;
                        return (
                          <label key={reason.id} className="flex items-start gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v: boolean | "indeterminate") => {
                                const current = field.value ?? [];
                                if (v === true) {
                                  field.onChange([...current, reason.id]);
                                } else {
                                  field.onChange(current.filter((id: number) => id !== reason.id));
                                }
                              }}
                            />
                            <span>
                              {reason.id}. {reason.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Field className="gap-3">
                <FieldLabel>Remark</FieldLabel>
                <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
                  {JUSTIFICATION_REMARKS.map((remark) => (
                    <li key={remark}>- {remark}</li>
                  ))}
                </ul>
              </Field>
            </div>
          )}

          <datalist id="pr-vendor-names">
            {savedVendorNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <datalist id="pr-vendor-contacts">
            {savedContacts.map((contact) => (
              <option key={contact} value={contact} />
            ))}
          </datalist>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <FieldLabel>Company Bidding List</FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendVendor({ vendorName: "", contact: "", note: "" })}
              >
                <Plus data-icon="inline-start" />
                Add Vendor
              </Button>
            </div>
            {vendorFields.length === 0 && <p className="text-muted-foreground text-sm">No vendors added.</p>}
            {vendorFields.map((vendorField, index) => (
              <div key={vendorField.id} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Vendor {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => removeVendor(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name={`biddingVendors.${index}.vendorName`}
                    render={({ field: f, fieldState }) => (
                      <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                        <FieldLabel>Vendor Name</FieldLabel>
                        <Input
                          {...f}
                          list="pr-vendor-names"
                          placeholder="Select or type a company..."
                          onBlur={(e) => {
                            f.onBlur();
                            saveVendorName(e.target.value);
                          }}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`biddingVendors.${index}.contact`}
                    render={({ field: f }) => (
                      <Field className="gap-1.5">
                        <FieldLabel>Contact</FieldLabel>
                        <Input
                          {...f}
                          list="pr-vendor-contacts"
                          placeholder="Select or type a contact..."
                          onBlur={(e) => {
                            f.onBlur();
                            saveContact(e.target.value);
                          }}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`biddingVendors.${index}.note`}
                    render={({ field: f }) => (
                      <Field className="gap-1.5 sm:col-span-2">
                        <FieldLabel>Note</FieldLabel>
                        <Textarea {...f} placeholder="Additional notes..." rows={2} />
                      </Field>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Attachments */}
      <Card className={cn(currentStep !== 2 && "hidden")}>
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

      {/* Step 4: Line Items with Budget Integration */}
      <Card className={cn(currentStep !== 3 && "hidden")}>
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
              <div key={field.id} className="flex flex-col gap-3 rounded-lg border p-4">
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
                    render={({ field: f, fieldState }) => (
                      <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                        <FieldLabel>Unit</FieldLabel>
                        <Input {...f} placeholder="EA" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                    <div className="flex h-9 items-center rounded-md bg-muted px-3 font-medium text-sm">
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
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/purchase")}>
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
          )}
          {!isLastStep && (
            <Button type="button" onClick={goNext}>
              Next
            </Button>
          )}
          {isLastStep && (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : initialData ? "Update Request" : "Create Request"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
