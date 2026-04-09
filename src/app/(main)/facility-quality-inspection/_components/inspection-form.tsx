"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { InspectionRow } from "@/lib/facility-quality-inspection";
import {
  INSPECTION_CATEGORIES,
  INSPECTION_TYPES,
  PRIORITY_LEVELS,
} from "@/lib/facility-quality-inspection";

const itemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  checkItem: z.string().min(1, "Check item is required"),
  result: z.string().default("PENDING"),
  priority: z.string().optional(),
  correctiveAction: z.string().optional(),
  actionParty: z.string().optional(),
  remarks: z.string().optional(),
});

const formSchema = z.object({
  facilityName: z.string().min(1, "Facility name is required"),
  facilityLocation: z.string().optional(),
  inspectionType: z.string().min(1, "Inspection type is required"),
  inspectionDate: z.string().min(1, "Inspection date is required"),
  description: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema),
});

type FormValues = z.infer<typeof formSchema>;

type FormItem = {
  category: string;
  checkItem: string;
  result: string;
  priority: string;
  correctiveAction: string;
  actionParty: string;
  remarks: string;
};

interface InspectionFormProps {
  inspectorId: string;
  initialData?: InspectionRow;
  templateItems?: FormItem[];
}

const emptyItem: FormItem = {
  category: "",
  checkItem: "",
  result: "PENDING",
  priority: "",
  correctiveAction: "",
  actionParty: "",
  remarks: "",
};

export function InspectionForm({
  inspectorId,
  initialData,
  templateItems,
}: InspectionFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/booking-car/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(console.error);
  }, []);

  const defaultItems: FormItem[] = initialData
    ? initialData.items.map((item) => ({
        category: item.category,
        checkItem: item.checkItem,
        result: item.result,
        priority: item.priority || "",
        correctiveAction: item.correctiveAction || "",
        actionParty: item.actionParty || "",
        remarks: item.remarks || "",
      }))
    : (templateItems ?? [emptyItem]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          facilityName: initialData.facilityName,
          facilityLocation: initialData.facilityLocation || "",
          inspectionType: initialData.inspectionType,
          inspectionDate: initialData.inspectionDate.split("T")[0],
          description: initialData.description || "",
          notes: initialData.notes || "",
          items: defaultItems,
        }
      : {
          facilityName: "",
          facilityLocation: "",
          inspectionType: "",
          inspectionDate: "",
          description: "",
          notes: "",
          items: defaultItems,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const url = initialData
        ? `/api/facility-quality-inspection/${initialData.id}`
        : "/api/facility-quality-inspection";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, inspectorId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      router.push("/facility-quality-inspection");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save inspection");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Inspection Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="facilityName"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel>Facility Name</FieldLabel>
                  <Input {...field} placeholder="e.g. Platform Alpha" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="facilityLocation"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel>Location</FieldLabel>
                  <Input
                    {...field}
                    placeholder="e.g. Block A, Gulf of Thailand"
                  />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="inspectionType"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel>Inspection Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INSPECTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="inspectionDate"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel>Date and Time of Inspection</FieldLabel>
                  <Input {...field} type="date" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Inspection scope and objectives..."
                    rows={3}
                  />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="notes"
              render={({ field }) => (
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel>Additional Hazards and Unsafe Acts</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Describe any additional hazards and unsafe acts observed during the inspection..."
                    rows={2}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Inspection Checklist</CardTitle>
          {/* <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                category: "",
                checkItem: "",
                result: "PENDING",
                priority: "",
                correctiveAction: "",
                actionParty: "",
                remarks: "",
              })
            }
          >
            <Plus data-icon="inline-start" />
            Add Row
          </Button> */}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="max-w-[100px]">Category</TableHead>
                  <TableHead className="max-w-[100px]">Check Item</TableHead>
                  <TableHead className="w-[100px]">YES/NO/N/A</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="min-w-[180px]">
                    Corrective Action
                  </TableHead>
                  <TableHead className="min-w-[130px]">Action Party</TableHead>
                  {/* <TableHead className="w-10" /> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id} className="align-top">
                    <TableCell className="pt-3 text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`items.${index}.category`}
                        render={({ field: f }) => (
                          <span>{f.value}</span>
                          // <Select value={f.value} onValueChange={f.onChange}>
                          //   <SelectTrigger className="h-9 text-xs">
                          //     <SelectValue placeholder="Category..." />
                          //   </SelectTrigger>
                          //   <SelectContent>
                          //     {INSPECTION_CATEGORIES.map((cat) => (
                          //       <SelectItem key={cat} value={cat}>
                          //         {cat}
                          //       </SelectItem>
                          //     ))}
                          //   </SelectContent>
                          // </Select>
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`items.${index}.checkItem`}
                        render={({ field: f }) => (
                          <span>{f.value}</span>
                          // <Input
                          //   {...f}
                          //   className="h-9 text-xs"
                          //   placeholder="e.g. Are spill kits strategically located?"
                          // />
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`items.${index}.result`}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={f.onChange}>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">-</SelectItem>
                              <SelectItem value="PASS">YES</SelectItem>
                              <SelectItem value="FAIL">NO</SelectItem>
                              <SelectItem value="NA">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`items.${index}.priority`}
                        render={({ field: f }) => (
                          <Select
                            value={f.value || "none"}
                            onValueChange={(val) =>
                              f.onChange(val === "none" ? "" : val)
                            }
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">-</SelectItem>
                              {PRIORITY_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`items.${index}.correctiveAction`}
                        render={({ field: f }) => (
                          <Input
                            {...f}
                            className="h-9 text-xs"
                            placeholder="Corrective action..."
                          />
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`items.${index}.actionParty`}
                        render={({ field: f }) => (
                          <Select
                            value={f.value || "none"}
                            onValueChange={(val) =>
                              f.onChange(val === "none" ? "" : val)
                            }
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">-</SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.name}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>

                    {/* <TableCell>
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
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {form.formState.errors.items?.root && (
            <p className="mt-2 text-destructive text-sm">
              {form.formState.errors.items.root.message}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/facility-quality-inspection")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : initialData
              ? "Update Inspection"
              : "Create Inspection"}
        </Button>
      </div>
    </form>
  );
}
