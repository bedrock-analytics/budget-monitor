"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import {
  CAR_OPTIONS,
  type CarBookingRow,
  type CarBookingUser,
} from "@/lib/booking-car";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const hotelSchema = z
  .object({
    hotelName: z.string().min(1, "Hotel name is required"),
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
  })
  .refine(
    (data) => {
      if (data.checkInDate && data.checkOutDate) {
        return new Date(data.checkInDate) < new Date(data.checkOutDate);
      }
      return true;
    },
    { message: "Check-out must be after check-in", path: ["checkOutDate"] },
  );

const passengerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  usePersonalCar: z.boolean().default(false),
  role: z.string().default("passenger"),
  userId: z.string().optional(),
});

const formSchema = z
  .object({
    projectCode: z.string().optional(),
    projectType: z.string().optional(),
    carIndex: z.string().min(1, "Car is required"),
    purpose: z.string().min(1, "Purpose is required"),
    destination: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    notes: z.string().optional(),
    passengers: z.array(passengerSchema),
    hotels: z.array(hotelSchema),
    trips: z.array(
      z
        .object({
          date: z.string().min(1, "Date is required"),
          departureTime: z.string().min(1, "Departure time is required"),
          arrivalTime: z.string().min(1, "Arrival time is required"),
          origin: z.string().min(1, "Origin is required"),
          destination: z.string().min(1, "Destination is required"),
          description: z.string().optional(),
        })
        .refine(
          (data) => {
            if (data.departureTime && data.arrivalTime) {
              return data.departureTime < data.arrivalTime;
            }
            return true;
          },
          {
            message: "Arrival must be after departure",
            path: ["arrivalTime"],
          },
        ),
    ),
    flights: z.array(
      z
        .object({
          flightNumber: z.string().optional(),
          airline: z.string().optional(),
          route: z.string().min(1, "Route is required"),
          departureTime: z.string().min(1, "Departure time is required"),
          arrivalTime: z.string().min(1, "Arrival time is required"),
          notes: z.string().optional(),
        })
        .refine(
          (data) => {
            if (data.departureTime && data.arrivalTime) {
              return new Date(data.departureTime) < new Date(data.arrivalTime);
            }
            return true;
          },
          {
            message: "Arrival must be after departure",
            path: ["arrivalTime"],
          },
        ),
    ),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] },
  );

type FormValues = z.infer<typeof formSchema>;

function toLocalDatetime(date: string) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function toLocalDate(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

function toLocalTime(date: string) {
  return new Date(date).toTimeString().slice(0, 5);
}

interface BookingFormProps {
  userId: string;
  booking?: CarBookingRow;
}

export function BookingForm({ userId, booking }: BookingFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState<CarBookingUser[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/booking-car/users");
      if (res.ok) setAllUsers(await res.json());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isEdit = !!booking;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: booking
      ? {
          projectCode: booking.projectCode || "",
          projectType: booking.projectType || "",
          carIndex: String(
            CAR_OPTIONS.findIndex(
              (c) => c.licensePlate === booking.licensePlate,
            ),
          ),
          purpose: booking.purpose,
          destination: booking.destination || "",
          startDate: toLocalDatetime(booking.startDate),
          endDate: toLocalDatetime(booking.endDate),
          notes: booking.notes || "",
          passengers: booking.passengers.map((p) => ({
            name: p.name,
            email: p.email || "",
            phone: p.phone || "",
            dateOfBirth: p.dateOfBirth ? toLocalDate(p.dateOfBirth) : "",
            usePersonalCar: p.usePersonalCar,
            role: p.role,
            userId: p.userId || "",
          })),
          hotels: booking.hotels.map((h) => ({
            hotelName: h.hotelName,
            checkInDate: toLocalDate(h.checkInDate),
            checkOutDate: toLocalDate(h.checkOutDate),
          })),
          trips: booking.trips.map((t) => ({
            date: toLocalDate(t.date),
            departureTime: toLocalTime(t.departureTime),
            arrivalTime: toLocalTime(t.arrivalTime),
            origin: t.origin,
            destination: t.destination,
            description: t.description || "",
          })),
          flights: booking.flights.map((f) => ({
            flightNumber: f.flightNumber || "",
            airline: f.airline || "",
            route: f.route,
            departureTime: toLocalDatetime(f.departureTime),
            arrivalTime: toLocalDatetime(f.arrivalTime),
            notes: f.notes || "",
          })),
        }
      : {
          projectCode: "",
          projectType: "",
          carIndex: "",
          purpose: "",
          destination: "",
          startDate: "",
          endDate: "",
          notes: "",
          passengers: [],
          hotels: [],
          trips: [],
          flights: [],
        },
  });

  const {
    fields: passengerFields,
    append: appendPassenger,
    remove: removePassenger,
  } = useFieldArray({
    control: form.control,
    name: "passengers",
  });

  const {
    fields: hotelFields,
    append: appendHotel,
    remove: removeHotel,
  } = useFieldArray({
    control: form.control,
    name: "hotels",
  });

  const {
    fields: tripFields,
    append: appendTrip,
    remove: removeTrip,
  } = useFieldArray({
    control: form.control,
    name: "trips",
  });

  const {
    fields: flightFields,
    append: appendFlight,
    remove: removeFlight,
  } = useFieldArray({
    control: form.control,
    name: "flights",
  });

  const onSubmit = async (values: FormValues) => {
    const car = CAR_OPTIONS[Number(values.carIndex)];
    if (!car) return;

    const payload = {
      userId,
      projectCode: values.projectCode || null,
      projectType: values.projectType || null,
      carName: car.name,
      licensePlate: car.licensePlate,
      purpose: values.purpose,
      destination: values.destination || null,
      startDate: values.startDate,
      endDate: values.endDate,
      notes: values.notes || null,
      passengers: values.passengers.map((p) => ({
        name: p.name,
        email: p.email || null,
        phone: p.phone || null,
        dateOfBirth: p.dateOfBirth || null,
        usePersonalCar: p.usePersonalCar,
        role: p.role || "passenger",
        userId: p.userId || null,
      })),
      hotels: values.hotels.map((h) => ({
        hotelName: h.hotelName,
        checkInDate: h.checkInDate,
        checkOutDate: h.checkOutDate,
      })),
      trips: values.trips.map((t) => ({
        date: t.date,
        departureTime: `${t.date}T${t.departureTime}`,
        arrivalTime: `${t.date}T${t.arrivalTime}`,
        origin: t.origin,
        destination: t.destination,
        description: t.description || null,
      })),
      flights: values.flights.map((f) => ({
        flightNumber: f.flightNumber || null,
        airline: f.airline || null,
        route: f.route,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        notes: f.notes || null,
      })),
    };

    try {
      setSubmitting(true);
      const url = isEdit
        ? `/api/booking-car/${booking.id}`
        : "/api/booking-car";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || `Failed to ${isEdit ? "update" : "create"} booking`,
        );
      }

      router.push("/booking-car");
      router.refresh();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : `Failed to ${isEdit ? "update" : "create"} booking`,
      );
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
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="projectCode"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel>Project Code</FieldLabel>
                  <Input {...field} placeholder="e.g. RVLCP.XX.XXXXX" />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel>Project Type</FieldLabel>
                  <Input {...field} placeholder="e.g. RVL_ZQ_Survey" />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="carIndex"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel>Car</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a car" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_OPTIONS.map((car, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {car.name} ({car.licensePlate})
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
              name="purpose"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel>Purpose</FieldLabel>
                  <Input
                    {...field}
                    placeholder="e.g. Site visit, Client meeting"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="destination"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel>Destination</FieldLabel>
                  <Input {...field} placeholder="e.g. Bangkok, Rayong" />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="notes"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="startDate"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel>Start Date</FieldLabel>
                  <Input {...field} type="datetime-local" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="endDate"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel>End Date</FieldLabel>
                  <Input {...field} type="datetime-local" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Passengers</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendPassenger({
                name: "",
                email: "",
                phone: "",
                dateOfBirth: "",
                usePersonalCar: false,
                role: "passenger",
                userId: "",
              })
            }
          >
            <Plus data-icon="inline-start" />
            Add Passenger
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {passengerFields.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No passengers added yet. Click &quot;Add Passenger&quot; to add
              one.
            </p>
          )}
          {passengerFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  Passenger {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  onClick={() => removePassenger(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <FieldGroup className="grid gap-3 sm:grid-cols-2">
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel>Link to User</FieldLabel>
                  <Select
                    value={form.watch(`passengers.${index}.userId`) || ""}
                    onValueChange={(uid) => {
                      const user = allUsers.find((u) => u.id === uid);
                      if (user) {
                        form.setValue(`passengers.${index}.userId`, user.id);
                        form.setValue(
                          `passengers.${index}.name`,
                          user.name || "",
                        );
                        form.setValue(`passengers.${index}.email`, user.email);
                        form.setValue(
                          `passengers.${index}.phone`,
                          user.phone || "",
                        );
                        form.setValue(
                          `passengers.${index}.dateOfBirth`,
                          user.dateOfBirth
                            ? new Date(user.dateOfBirth)
                                .toISOString()
                                .split("T")[0]
                            : "",
                        );
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user to auto-fill..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Controller
                  control={form.control}
                  name={`passengers.${index}.name`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Name</FieldLabel>
                      <Input {...f} placeholder="Full name" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`passengers.${index}.email`}
                  render={({ field: f }) => (
                    <Field className="gap-1.5">
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        {...f}
                        type="email"
                        placeholder="email@example.com"
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`passengers.${index}.phone`}
                  render={({ field: f }) => (
                    <Field className="gap-1.5">
                      <FieldLabel>Phone</FieldLabel>
                      <Input
                        {...f}
                        type="tel"
                        placeholder="e.g. 081-234-5678"
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`passengers.${index}.dateOfBirth`}
                  render={({ field: f }) => (
                    <Field className="gap-1.5">
                      <FieldLabel>Date of Birth</FieldLabel>
                      <Input {...f} type="date" />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`passengers.${index}.usePersonalCar`}
                  render={({ field: f }) => (
                    <Field className="flex items-center gap-2 sm:col-span-2">
                      <Checkbox
                        checked={f.value}
                        onCheckedChange={f.onChange}
                      />
                      <FieldLabel className="mb-0 cursor-pointer">
                        Use Personal Car
                      </FieldLabel>
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Hotel Booking</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendHotel({ hotelName: "", checkInDate: "", checkOutDate: "" })
            }
          >
            <Plus data-icon="inline-start" />
            Add Hotel
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {hotelFields.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No hotel bookings added. Click &quot;Add Hotel&quot; if you need
              accommodation.
            </p>
          )}
          {hotelFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Hotel {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  onClick={() => removeHotel(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <FieldGroup className="grid gap-3 sm:grid-cols-3">
                <Controller
                  control={form.control}
                  name={`hotels.${index}.hotelName`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Hotel Name</FieldLabel>
                      <Input {...f} placeholder="e.g. Ibis Rayong" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`hotels.${index}.checkInDate`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Check-in</FieldLabel>
                      <Input {...f} type="date" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`hotels.${index}.checkOutDate`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Check-out</FieldLabel>
                      <Input {...f} type="date" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Daily Car Usage</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendTrip({
                date: "",
                departureTime: "",
                arrivalTime: "",
                origin: "",
                destination: "",
                description: "",
              })
            }
          >
            <Plus data-icon="inline-start" />
            Add Trip
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {tripFields.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No daily trips added. Click &quot;Add Trip&quot; to plan your
              daily car usage during the business trip.
            </p>
          )}
          {tripFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Day {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  onClick={() => removeTrip(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <FieldGroup className="grid gap-3 sm:grid-cols-3">
                <Controller
                  control={form.control}
                  name={`trips.${index}.date`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Date</FieldLabel>
                      <Input {...f} type="date" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`trips.${index}.departureTime`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Departure Time</FieldLabel>
                      <Input {...f} type="time" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`trips.${index}.arrivalTime`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Arrival Time</FieldLabel>
                      <Input {...f} type="time" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`trips.${index}.origin`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>From</FieldLabel>
                      <Input {...f} placeholder="e.g. Office, Hotel" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`trips.${index}.destination`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>To</FieldLabel>
                      <Input {...f} placeholder="e.g. Client site, Factory" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`trips.${index}.description`}
                  render={({ field: f }) => (
                    <Field className="gap-1.5">
                      <FieldLabel>Description</FieldLabel>
                      <Input {...f} placeholder="e.g. Site inspection" />
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Flight Booking</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendFlight({
                flightNumber: "",
                airline: "",
                route: "",
                departureTime: "",
                arrivalTime: "",
                notes: "",
              })
            }
          >
            <Plus data-icon="inline-start" />
            Add Flight
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {flightFields.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No flights added. Click &quot;Add Flight&quot; if you need a
              flight.
            </p>
          )}
          {flightFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Flight {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  onClick={() => removeFlight(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <FieldGroup className="grid gap-3 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name={`flights.${index}.route`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5 sm:col-span-2"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Route / Flight Detail</FieldLabel>
                      <Input
                        {...f}
                        placeholder="e.g. BKK → HKT, Bangkok to Phuket"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`flights.${index}.airline`}
                  render={({ field: f }) => (
                    <Field className="gap-1.5">
                      <FieldLabel>Airline</FieldLabel>
                      <Input {...f} placeholder="e.g. Thai Airways, AirAsia" />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`flights.${index}.flightNumber`}
                  render={({ field: f }) => (
                    <Field className="gap-1.5">
                      <FieldLabel>Flight Number</FieldLabel>
                      <Input {...f} placeholder="e.g. TG 205" />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`flights.${index}.departureTime`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Departure Time</FieldLabel>
                      <Input {...f} type="datetime-local" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`flights.${index}.arrivalTime`}
                  render={({ field: f, fieldState }) => (
                    <Field
                      className="gap-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel>Arrival Time</FieldLabel>
                      <Input {...f} type="datetime-local" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`flights.${index}.notes`}
                  render={({ field: f }) => (
                    <Field className="gap-1.5 sm:col-span-2">
                      <FieldLabel>Notes</FieldLabel>
                      <Input {...f} placeholder="e.g. Window seat preferred" />
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/booking-car")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? isEdit
              ? "Saving..."
              : "Creating..."
            : isEdit
              ? "Save Changes"
              : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}
