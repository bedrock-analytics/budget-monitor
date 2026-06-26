"use client";

import { useState } from "react";

import Link from "next/link";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CarBookingRow, CarBookingStatus } from "@/lib/booking-car";

import { BookingStatusBadge } from "./booking-status-badge";

interface BookingTableProps {
  data: CarBookingRow[];
  // currentUserId?: string;
  onStatusChange: (id: string, status: CarBookingStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function BookingTable({
  data,
  // currentUserId,
  onStatusChange,
  onDelete,
}: BookingTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: CarBookingStatus) => {
    setUpdatingId(id);
    await onStatusChange(id, status);
    setUpdatingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Booking #</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Car</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">License Plate</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created by</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Passengers</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Purpose</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Start</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">End</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Daily Trips</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hotel</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Flight</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              )}
              {data.map((row) => {
                const passengerList = row.passengers?.filter((p) => p.role === "passenger") ?? [];

                return (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{row.bookingNumber}</td>
                    <td className="px-4 py-3">{row.carName}</td>
                    <td className="px-4 py-3">{row.licensePlate}</td>
                    <td className="px-4 py-3">{row.user.name || row.user.email}</td>
                    <td className="max-w-[260px] px-4 py-3">
                      {passengerList.length === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {passengerList.map((p) => (
                            <div key={p.id} className="text-xs">
                              <span className="font-medium">{p.name}</span>
                              {p.email && (
                                <>
                                  <br />
                                  <span className="text-muted-foreground">{p.email}</span>
                                </>
                              )}
                              {p.phone && (
                                <>
                                  {" "}
                                  <span className="text-muted-foreground">· {p.phone}</span>
                                </>
                              )}
                              {p.dateOfBirth && (
                                <>
                                  <br />
                                  <span className="text-muted-foreground">
                                    DOB: {new Date(p.dateOfBirth).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3">{row.purpose}</td>
                    <td className="whitespace-nowrap px-4 py-3">{new Date(row.startDate).toLocaleDateString()}</td>
                    <td className="whitespace-nowrap px-4 py-3">{new Date(row.endDate).toLocaleDateString()}</td>
                    <td className="max-w-[240px] px-4 py-3">
                      {(row.trips?.length ?? 0) === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {row.trips.map((t) => (
                            <div key={t.id} className="text-xs">
                              <span className="text-muted-foreground">
                                {new Date(t.date).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>{" "}
                              <span className="font-medium">
                                {t.origin} → {t.destination}
                              </span>
                              <br />
                              <span className="text-muted-foreground">
                                {new Date(t.departureTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                –{" "}
                                {new Date(t.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {t.description && (
                                <>
                                  {" "}
                                  <span className="text-muted-foreground italic">({t.description})</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      {(row.hotels?.length ?? 0) === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {row.hotels.map((h) => (
                            <div key={h.id} className="text-xs">
                              <span className="font-medium">{h.hotelName}</span>
                              <br />
                              <span className="text-muted-foreground">
                                {new Date(h.checkInDate).toLocaleDateString()} –{" "}
                                {new Date(h.checkOutDate).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="max-w-[240px] px-4 py-3">
                      {(row.flights?.length ?? 0) === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {row.flights.map((f) => (
                            <div key={f.id} className="text-xs">
                              <span className="font-medium">{f.route}</span>
                              {(f.airline || f.flightNumber) && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  ({[f.airline, f.flightNumber].filter(Boolean).join(" ")})
                                </span>
                              )}
                              <br />
                              <span className="text-muted-foreground">
                                {new Date(f.departureTime).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                →{" "}
                                {new Date(f.arrivalTime).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(row.status === "PENDING" || row.status === "APPROVED") && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/booking-car/${row.id}/edit`}>
                              <Pencil className="size-3.5" />
                              Edit
                            </Link>
                          </Button>
                        )}
                        {row.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingId === row.id}
                              onClick={() => handleStatusChange(row.id, "APPROVED")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingId === row.id}
                              onClick={() => handleStatusChange(row.id, "REJECTED")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {row.status === "APPROVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingId === row.id}
                            onClick={() => handleStatusChange(row.id, "IN_USE")}
                          >
                            Pick Up
                          </Button>
                        )}
                        {row.status === "IN_USE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingId === row.id}
                            onClick={() => handleStatusChange(row.id, "RETURNED")}
                          >
                            Return
                          </Button>
                        )}
                        {(row.status === "PENDING" || row.status === "APPROVED") && (
                          // row.userId === currentUserId &&
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={updatingId === row.id}
                            onClick={() => handleStatusChange(row.id, "CANCELLED")}
                          >
                            Cancel
                          </Button>
                        )}
                        {(row.status === "CANCELLED" || row.status === "REJECTED" || row.status === "RETURNED") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={updatingId === row.id}
                            onClick={() => onDelete(row.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
