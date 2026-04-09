"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { EllipsisVertical, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InspectionRow } from "@/lib/facility-quality-inspection";

import { InspectionResultBadge, InspectionStatusBadge } from "./inspection-status-badge";

interface InspectionTableProps {
  data: InspectionRow[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function InspectionTable({ data, onStatusChange, onDelete }: InspectionTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo<ColumnDef<InspectionRow>[]>(
    () => [
      {
        accessorKey: "inspectionNumber",
        header: "Inspection #",
        cell: ({ row }) => (
          <Link
            href={`/facility-quality-inspection/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.inspectionNumber}
          </Link>
        ),
      },
      {
        accessorKey: "facilityName",
        header: "Facility",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="max-w-[200px] truncate font-medium">{row.original.facilityName}</span>
            {row.original.facilityLocation && (
              <span className="text-muted-foreground text-xs">{row.original.facilityLocation}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "inspectionType",
        header: "Type",
        cell: ({ row }) => <span className="text-sm">{row.original.inspectionType}</span>,
      },
      {
        accessorKey: "inspector.name",
        header: "Inspector",
        cell: ({ row }) => row.original.inspector.name || row.original.inspector.email,
      },
      {
        accessorKey: "inspectionDate",
        header: "Inspection Date",
        cell: ({ row }) => format(new Date(row.original.inspectionDate), "dd MMM yyyy"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <InspectionStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "overallResult",
        header: "Result",
        cell: ({ row }) => <InspectionResultBadge result={row.original.overallResult} />,
      },
      {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => <Badge variant="outline">{row.original.items.length} items</Badge>,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const inspection = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={`/facility-quality-inspection/${inspection.id}`}>View</Link>
                </DropdownMenuItem>
                {inspection.status === "DRAFT" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/facility-quality-inspection/${inspection.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(inspection.id, "SCHEDULED")}>
                      Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(inspection.id, "IN_PROGRESS")}>
                      Start Inspection
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(inspection.id)}>
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {inspection.status === "SCHEDULED" && (
                  <DropdownMenuItem onClick={() => onStatusChange(inspection.id, "IN_PROGRESS")}>
                    Start Inspection
                  </DropdownMenuItem>
                )}
                {inspection.status === "IN_PROGRESS" && (
                  <DropdownMenuItem onClick={() => onStatusChange(inspection.id, "COMPLETED")}>
                    Mark Completed
                  </DropdownMenuItem>
                )}
                {inspection.status === "COMPLETED" && (
                  <>
                    <DropdownMenuItem onClick={() => onStatusChange(inspection.id, "APPROVED")}>
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onStatusChange(inspection.id, "REJECTED")}
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
    [onStatusChange, onDelete],
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
        <CardTitle>Inspections</CardTitle>
        <CardAction>
          <Button asChild size="sm">
            <Link href="/facility-quality-inspection/create">
              <Plus data-icon="inline-start" />
              New Inspection
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by inspection number or facility..."
              value={(table.getColumn("inspectionNumber")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("inspectionNumber")?.setFilterValue(e.target.value)}
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No inspections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{table.getFilteredRowModel().rows.length} total inspection(s)</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
