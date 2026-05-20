"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTHB, formatUSD } from "@/lib/utils";

const PAGE_SIZE = 5;

interface BudgetDetailRecord {
  id: string;
  projectType: string;
  projectCode: string;
  budgetCategory: string;
  budgetItemName: string;
  system: string;
  type: string;
  no: string;
  acctCode: string;
  accountName: string;
  date: string | null;
  vendor: string;
  remark: string;
  reservedTHB: string | number;
  actualTHB: string | number;
  totalSpentTHB: string | number;
  rate: string | number;
  reservedUSD: string | number;
  actualUSD: string | number;
  totalSpentUSD: string | number;
  creator: string;
}

interface Props {
  projectCode: string;
}

const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : "—");

export function ProjectBudgetDetailTable({ projectCode }: Props) {
  const [rows, setRows] = useState<BudgetDetailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/budget-detail?projectCode=${encodeURIComponent(projectCode)}`);
        if (!res.ok) throw new Error("Failed to load budget detail");
        const data = (await res.json()) as BudgetDetailRecord[];
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectCode]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.no.toLowerCase().includes(q) ||
        r.vendor.toLowerCase().includes(q) ||
        r.remark.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.budgetCategory.toLowerCase().includes(q) ||
        r.budgetItemName.toLowerCase().includes(q) ||
        r.accountName.toLowerCase().includes(q) ||
        r.acctCode.toLowerCase().includes(q) ||
        r.creator.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page when filter inputs change
  useEffect(() => {
    setPage(1);
  }, [search, projectCode]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.reservedTHB += Number(r.reservedTHB);
        acc.actualTHB += Number(r.actualTHB);
        acc.totalSpentTHB += Number(r.totalSpentTHB);
        acc.reservedUSD += Number(r.reservedUSD);
        acc.actualUSD += Number(r.actualUSD);
        acc.totalSpentUSD += Number(r.totalSpentUSD);
        return acc;
      },
      {
        reservedTHB: 0,
        actualTHB: 0,
        totalSpentTHB: 0,
        reservedUSD: 0,
        actualUSD: 0,
        totalSpentUSD: 0,
      },
    );
  }, [filtered]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Order</CardTitle>
        <CardDescription>
          {loading ? "Loading..." : `${filtered.length} of ${rows.length} entries for ${projectCode}`}
          {error && ` · ${error}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Search PO no., vendor, remark, item, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Budget Item</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Remark</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">{r.no || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(r.date)}</TableCell>
                  <TableCell className="text-muted-foreground">{r.type || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.budgetCategory || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.budgetItemName || "—"}</TableCell>
                  <TableCell>{r.vendor || "—"}</TableCell>
                  <TableCell className="max-w-[240px] text-muted-foreground">
                    <div className="whitespace-pre-wrap break-words">{r.remark || "—"}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <div>{formatTHB(Number(r.reservedTHB))}</div>
                    <div className="font-normal text-muted-foreground">{formatUSD(Number(r.reservedUSD))}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <div>{formatTHB(Number(r.actualTHB))}</div>
                    <div className="font-normal text-muted-foreground">{formatUSD(Number(r.actualUSD))}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <div>{formatTHB(Number(r.totalSpentTHB))}</div>
                    <div className="font-normal text-muted-foreground">{formatUSD(Number(r.totalSpentUSD))}</div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                    {rows.length === 0 ? "No budget detail for this project." : "No entries match your search."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {filtered.length > 0 && (
              <TableFooter>
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={7}>Total ({filtered.length})</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <div>{formatTHB(totals.reservedTHB)}</div>
                    <div className="font-normal text-muted-foreground">{formatUSD(totals.reservedUSD)}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <div>{formatTHB(totals.actualTHB)}</div>
                    <div className="font-normal text-muted-foreground">{formatUSD(totals.actualUSD)}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <div>{formatTHB(totals.totalSpentTHB)}</div>
                    <div className="font-normal text-muted-foreground">{formatUSD(totals.totalSpentUSD)}</div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        {filtered.length > PAGE_SIZE && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}
