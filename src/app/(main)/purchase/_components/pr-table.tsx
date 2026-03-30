"use client";

import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { EllipsisVertical, Plus, Search } from "lucide-react";

import type { PurchaseRequestRow } from "@/lib/purchase-request";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PRStatusBadge } from "./pr-status-badge";

interface PRTableProps {
  data: PurchaseRequestRow[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function PRTable({ data, onStatusChange, onDelete }: PRTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const formatCurrency = useCallback((value: number, currency: string) => {
    if (currency === "USD") {
      return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
    }
    return value.toLocaleString("th-TH", { style: "currency", currency: "THB" });
  }, []);

  const columns = useMemo<ColumnDef<PurchaseRequestRow>[]>(
    () => [
      {
        accessorKey: "prNumber",
        header: "PR Number",
        cell: ({ row }) => (
          <Link
            href={`/purchase/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.prNumber}
          </Link>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="max-w-[200px] truncate block">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "requester.name",
        header: "Requester",
        cell: ({ row }) =>
          row.original.requester.name || row.original.requester.email,
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => row.original.department || "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <PRStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "totalAmount",
        header: "Total Amount",
        cell: ({ row }) =>
          formatCurrency(row.original.totalAmount, row.original.currency),
      },
      {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.items.length} items</Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          format(new Date(row.original.createdAt), "dd MMM yyyy"),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const pr = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href={`/purchase/${pr.id}`}>View</Link>
                </DropdownMenuItem>
                {pr.status === "DRAFT" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/purchase/${pr.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(pr.id, "SUBMITTED")}
                    >
                      Submit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(pr.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {pr.status === "SUBMITTED" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(pr.id, "APPROVED")}
                    >
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onStatusChange(pr.id, "REJECTED")}
                    >
                      Reject
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [formatCurrency, onStatusChange, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, pagination },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Requests</CardTitle>
        <CardAction>
          <Button asChild size="sm">
            <Link href="/purchase/create">
              <Plus data-icon="inline-start" />
              New Request
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by PR number or title..."
              value={
                (table.getColumn("prNumber")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("prNumber")?.setFilterValue(e.target.value)
              }
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No purchase requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {table.getFilteredRowModel().rows.length} total request(s)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
