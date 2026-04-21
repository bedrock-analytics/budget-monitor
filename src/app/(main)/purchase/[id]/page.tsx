"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { format } from "date-fns";
import { ArrowLeft, Edit, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PurchaseRequestRow } from "@/lib/purchase-request";

import { PRStatusBadge } from "../_components/pr-status-badge";

export default function PurchaseRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pr, setPR] = useState<PurchaseRequestRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/purchase-request/${id}`);
      if (!res.ok) throw new Error("Not found");
      setPR(await res.json());
    } catch {
      setPR(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (status: string) => {
    try {
      const res = await fetch(`/api/purchase-request/${id}`, {
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

  const formatCurrency = useCallback(
    (value: number) => {
      if (pr?.currency === "USD") {
        return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
      }
      return value.toLocaleString("th-TH", { style: "currency", currency: "THB" });
    },
    [pr?.currency],
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Purchase request not found</p>
        <Button asChild variant="outline">
          <Link href="/purchase">Back to list</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/purchase")}>
            <ArrowLeft />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-2xl">{pr.prNumber}</h1>
              <PRStatusBadge status={pr.status} />
            </div>
            <p className="mt-1 text-muted-foreground text-sm">{pr.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pr.status === "DRAFT" && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/purchase/${pr.id}/edit`}>
                  <Edit data-icon="inline-start" />
                  Edit
                </Link>
              </Button>
              <Button size="sm" onClick={() => handleStatusChange("SUBMITTED")}>
                <Send data-icon="inline-start" />
                Submit
              </Button>
            </>
          )}
          {pr.status === "SUBMITTED" && (
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
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Requester</dt>
                <dd className="font-medium">{pr.requester.name || pr.requester.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Department</dt>
                <dd className="font-medium">{pr.department || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Currency</dt>
                <dd className="font-medium">{pr.currency}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">{format(new Date(pr.createdAt), "dd MMM yyyy HH:mm")}</dd>
              </div>
              {pr.dueDate && (
                <div>
                  <dt className="text-muted-foreground">Due Date</dt>
                  <dd className="font-medium">{format(new Date(pr.dueDate), "dd MMM yyyy")}</dd>
                </div>
              )}
              {pr.deliveryTo && (
                <div>
                  <dt className="text-muted-foreground">Delivery To</dt>
                  <dd className="font-medium">{pr.deliveryTo}</dd>
                </div>
              )}
              {pr.proposedStrategy && (
                <div>
                  <dt className="text-muted-foreground">Proposed Strategy</dt>
                  <dd className="font-medium">
                    {pr.proposedStrategy === "DIRECT_NEGOTIATION" ? "Direct Negotiation" : "Call for Tender"}
                  </dd>
                </div>
              )}
              {pr.budget && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Budget Line</dt>
                  <dd className="flex flex-wrap items-center gap-2 font-medium">
                    <span>
                      {pr.budget.projectTypeName} - {pr.budget.budgetItemName}
                    </span>
                    {(() => {
                      const available = pr.currency === "USD" ? pr.budget.availableUSD : pr.budget.availableTHB;
                      return (
                        <Badge variant={available >= pr.totalAmount ? "outline" : "destructive"}>
                          {formatCurrency(available)} available
                        </Badge>
                      );
                    })()}
                  </dd>
                </div>
              )}
              {pr.businessJustification && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Business Justification</dt>
                  <dd className="font-medium">{pr.businessJustification}</dd>
                </div>
              )}
              {pr.description && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Description</dt>
                  <dd className="font-medium">{pr.description}</dd>
                </div>
              )}
              {pr.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Notes</dt>
                  <dd className="font-medium">{pr.notes}</dd>
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
              <Badge variant="outline">{pr.items.length}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Total Amount</span>
              <span className="font-bold text-lg">{formatCurrency(pr.totalAmount)}</span>
            </div>
            {pr.submittedAt && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Submitted</span>
                  <span className="text-sm">{format(new Date(pr.submittedAt), "dd MMM yyyy")}</span>
                </div>
              </>
            )}
            {pr.approvedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Approved</span>
                <span className="text-sm">{format(new Date(pr.approvedAt), "dd MMM yyyy")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pr.items.map((item, idx) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(item.totalPrice)}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={6} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold tabular-nums">{formatCurrency(pr.totalAmount)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
