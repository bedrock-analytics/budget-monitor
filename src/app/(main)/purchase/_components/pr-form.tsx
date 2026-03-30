"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import type { BudgetOption, PurchaseRequestRow } from "@/lib/purchase-request";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Plus, Trash2 } from "lucide-react";

const itemSchema = z.object({
  budgetId: z.string().min(1, "Budget is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit: z.string().default("EA"),
  unitPrice: z.coerce.number().min(0.01, "Unit price must be greater than 0"),
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  department: z.string().optional(),
  currency: z.enum(["THB", "USD"]).default("THB"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface PRFormProps {
  requesterId: string;
  initialData?: PurchaseRequestRow;
}

export function PRForm({ requesterId, initialData }: PRFormProps) {
  const router = useRouter();
  const [budgetOptions, setBudgetOptions] = useState<BudgetOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description || "",
          department: initialData.department || "",
          currency: initialData.currency as "THB" | "USD",
          notes: initialData.notes || "",
          items: initialData.items.map((item) => ({
            budgetId: item.budget.id,
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
          items: [
            {
              budgetId: "",
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

  const totalAmount = watchItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0,
  );

  useEffect(() => {
    fetch("/api/budget/options")
      .then((res) => res.json())
      .then(setBudgetOptions)
      .catch(console.error);
  }, []);

  const formatCurrency = useCallback(
    (value: number) => {
      if (watchCurrency === "USD") {
        return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
      }
      return value.toLocaleString("th-TH", { style: "currency", currency: "THB" });
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

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const url = initialData
        ? `/api/purchase-request/${initialData.id}`
        : "/api/purchase-request";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, requesterId }),
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
                budgetId: "",
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
            const selectedBudgetId = watchItems[index]?.budgetId;
            const available = selectedBudgetId
              ? getBudgetAvailable(selectedBudgetId)
              : null;
            const itemTotal =
              (watchItems[index]?.quantity || 0) *
              (watchItems[index]?.unitPrice || 0);

            return (
              <div
                key={field.id}
                className="rounded-lg border p-4 flex flex-col gap-3"
              >
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
                  {/* Budget Selection */}
                  <Controller
                    control={form.control}
                    name={`items.${index}.budgetId`}
                    render={({ field: f, fieldState }) => (
                      <Field className="gap-1.5 sm:col-span-2" data-invalid={fieldState.invalid}>
                        <FieldLabel>Budget Line</FieldLabel>
                        <Select value={f.value} onValueChange={f.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget..." />
                          </SelectTrigger>
                          <SelectContent>
                            {budgetOptions.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.projectTypeName} - {b.budgetItemName} (
                                {watchCurrency === "USD"
                                  ? `$${b.availableUSD.toLocaleString()}`
                                  : `฿${b.availableTHB.toLocaleString()}`}{" "}
                                available)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                        {available !== null && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">
                              Available budget:
                            </span>
                            <Badge
                              variant={
                                available >= itemTotal ? "outline" : "destructive"
                              }
                            >
                              {formatCurrency(available)}
                            </Badge>
                            {available < itemTotal && (
                              <span className="text-destructive">
                                Exceeds available budget!
                              </span>
                            )}
                          </div>
                        )}
                      </Field>
                    )}
                  />

                  {/* Description */}
                  <Controller
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field: f, fieldState }) => (
                      <Field className="gap-1.5 sm:col-span-2" data-invalid={fieldState.invalid}>
                        <FieldLabel>Description</FieldLabel>
                        <Input {...f} placeholder="Item description..." />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
                        <Input
                          {...f}
                          type="number"
                          min={1}
                          onChange={(e) => f.onChange(Number(e.target.value))}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
            <p className="text-destructive text-sm">
              {form.formState.errors.items.root.message}
            </p>
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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/purchase")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : initialData
              ? "Update Request"
              : "Create Request"}
        </Button>
      </div>
    </form>
  );
}
