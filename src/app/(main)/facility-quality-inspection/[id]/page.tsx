"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { format } from "date-fns";
import { ArrowLeft, Edit, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InspectionRow } from "@/lib/facility-quality-inspection";

import {
  InspectionPriorityBadge,
  InspectionResultBadge,
  InspectionStatusBadge,
} from "../_components/inspection-status-badge";

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inspection, setInspection] = useState<InspectionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/facility-quality-inspection/${id}`);
      if (!res.ok) throw new Error("Not found");
      setInspection(await res.json());
    } catch {
      setInspection(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (status: string) => {
    try {
      const res = await fetch(`/api/facility-quality-inspection/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      fetchData();
    } catch {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Inspection not found</p>
        <Button asChild variant="outline">
          <Link href="/facility-quality-inspection">Back to list</Link>
        </Button>
      </div>
    );
  }

  const categories = [...new Set(inspection.items.map((i) => i.category))];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/facility-quality-inspection")}>
            <ArrowLeft />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-2xl">{inspection.inspectionNumber}</h1>
              <InspectionStatusBadge status={inspection.status} />
              <InspectionResultBadge result={inspection.overallResult} />
            </div>
            <p className="mt-1 text-muted-foreground text-sm">{inspection.facilityName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {inspection.status === "DRAFT" && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/facility-quality-inspection/${inspection.id}/edit`}>
                  <Edit data-icon="inline-start" />
                  Edit
                </Link>
              </Button>
              <Button size="sm" onClick={() => handleStatusChange("SCHEDULED")}>
                Schedule
              </Button>
              <Button size="sm" onClick={() => handleStatusChange("IN_PROGRESS")}>
                <Play data-icon="inline-start" />
                Start
              </Button>
            </>
          )}
          {inspection.status === "SCHEDULED" && (
            <Button size="sm" onClick={() => handleStatusChange("IN_PROGRESS")}>
              <Play data-icon="inline-start" />
              Start Inspection
            </Button>
          )}
          {inspection.status === "IN_PROGRESS" && (
            <Button size="sm" onClick={() => handleStatusChange("COMPLETED")}>
              Mark Completed
            </Button>
          )}
          {inspection.status === "COMPLETED" && (
            <>
              <Button size="sm" onClick={() => handleStatusChange("APPROVED")}>
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleStatusChange("REJECTED")}>
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inspection Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Facility</dt>
                <dd className="font-medium">{inspection.facilityName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-medium">{inspection.facilityLocation || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Inspection Type</dt>
                <dd className="font-medium">{inspection.inspectionType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Inspected By</dt>
                <dd className="font-medium">{inspection.inspector.name || inspection.inspector.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Date and Time of Inspection</dt>
                <dd className="font-medium">{format(new Date(inspection.inspectionDate), "dd MMM yyyy")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">{format(new Date(inspection.createdAt), "dd MMM yyyy HH:mm")}</dd>
              </div>
              {inspection.description && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Description</dt>
                  <dd className="font-medium">{inspection.description}</dd>
                </div>
              )}
              {inspection.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Additional Hazards and Unsafe Acts</dt>
                  <dd className="font-medium">{inspection.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Total Items</span>
              <Badge variant="outline">{inspection.items.length}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">YES</span>
              <Badge variant="default">{inspection.items.filter((i) => i.result === "PASS").length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">NO</span>
              <Badge variant="destructive">{inspection.items.filter((i) => i.result === "FAIL").length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">N/A</span>
              <Badge variant="secondary">{inspection.items.filter((i) => i.result === "NA").length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Pending</span>
              <Badge variant="secondary">{inspection.items.filter((i) => i.result === "PENDING").length}</Badge>
            </div>
            {inspection.scheduledAt && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Scheduled</span>
                  <span className="text-sm">{format(new Date(inspection.scheduledAt), "dd MMM yyyy")}</span>
                </div>
              </>
            )}
            {inspection.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Completed</span>
                <span className="text-sm">{format(new Date(inspection.completedAt), "dd MMM yyyy")}</span>
              </div>
            )}
            {inspection.approvedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Approved</span>
                <span className="text-sm">{format(new Date(inspection.approvedAt), "dd MMM yyyy")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checklist Items Table - grouped by category */}
      {categories.map((category) => {
        const categoryItems = inspection.items.filter((i) => i.category === category);
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Check Item</TableHead>
                    <TableHead className="w-20">YES</TableHead>
                    <TableHead className="w-20">NO</TableHead>
                    <TableHead className="w-20">N/A</TableHead>
                    <TableHead className="w-20">Priority</TableHead>
                    <TableHead>Corrective Action</TableHead>
                    <TableHead>Action Party</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryItems.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{item.checkItem}</TableCell>
                      <TableCell className="text-center">{item.result === "PASS" ? "X" : ""}</TableCell>
                      <TableCell className="text-center">{item.result === "FAIL" ? "X" : ""}</TableCell>
                      <TableCell className="text-center">{item.result === "NA" ? "X" : ""}</TableCell>
                      <TableCell>
                        <InspectionPriorityBadge priority={item.priority} />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.correctiveAction || "-"}</TableCell>
                      <TableCell>{item.actionParty || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
