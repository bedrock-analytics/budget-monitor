"use client";

import { Fragment, useMemo, useState } from "react";

import { ChevronDown, ChevronRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatUSD } from "@/lib/utils";

import type { ActivityRecord } from "./types";

interface Props {
  activities: ActivityRecord[];
}

interface Group {
  groupName: string;
  rows: ActivityRecord[];
  estimateUSD: number;
  actualUSD: number;
}

export function ActivitiesTable({ activities }: Props) {
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(
      (a) =>
        a.description.toLowerCase().includes(q) ||
        a.itemCode.toLowerCase().includes(q) ||
        a.groupName.toLowerCase().includes(q),
    );
  }, [activities, search]);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const a of filtered) {
      const key = a.groupName || "—";
      let g = map.get(key);
      if (!g) {
        g = { groupName: key, rows: [], estimateUSD: 0, actualUSD: 0 };
        map.set(key, g);
      }
      g.rows.push(a);
      g.estimateUSD += Number(a.sumPOUSD);
      g.actualUSD += Number(a.invoiceUSD);
    }
    return Array.from(map.values());
  }, [filtered]);

  const totals = useMemo(
    () => ({
      estimateUSD: filtered.reduce((s, a) => s + Number(a.sumPOUSD), 0),
      actualUSD: filtered.reduce((s, a) => s + Number(a.invoiceUSD), 0),
    }),
    [filtered],
  );

  const toggle = (name: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities</CardTitle>
        <CardDescription>
          {filtered.length} of {activities.length} activities · grouped by scope
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Search activity, group, or item code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8 px-2 py-3" />
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">Activity / Group</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">Item Code</th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground">Reserved (USD)</th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground">Actual (USD)</th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground">Available</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const isOpen = openGroups.has(g.groupName);
                const variance = g.estimateUSD - g.actualUSD;
                return (
                  <Fragment key={g.groupName}>
                    <tr
                      className="cursor-pointer border-b bg-muted/30 font-medium hover:bg-muted/40"
                      onClick={() => toggle(g.groupName)}
                    >
                      <td className="px-2 py-2.5 text-muted-foreground">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="px-3 py-2.5" colSpan={2}>
                        {g.groupName}
                        <span className="ml-2 font-normal text-muted-foreground text-xs">
                          ({g.rows.length} {g.rows.length === 1 ? "item" : "items"})
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatUSD(g.estimateUSD)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatUSD(g.actualUSD)}</td>
                      <td
                        className={`px-3 py-2.5 text-right tabular-nums ${variance < 0 ? "text-destructive" : "text-green-600"}`}
                      >
                        {formatUSD(variance)}
                      </td>
                    </tr>
                    {isOpen &&
                      g.rows.map((a) => {
                        const rowVariance = Number(a.sumPOUSD) - Number(a.invoiceUSD);
                        return (
                          <tr key={a.id} className="border-b last:border-0 hover:bg-muted/10">
                            <td />
                            <td className="px-3 py-2 pl-6 text-muted-foreground">{a.description}</td>
                            <td className="px-3 py-2 text-muted-foreground text-xs">{a.itemCode}</td>
                            {/* <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                              {Number(a.rate) > 0
                                ? Number(a.rate).toLocaleString()
                                : "—"}
                            </td>
                            <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">
                              {Number(a.trackingAmount) > 0
                                ? Number(a.trackingAmount).toLocaleString()
                                : "—"}
                            </td> */}
                            <td className="px-3 py-2 text-right tabular-nums">{formatUSD(Number(a.sumPOUSD))}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{formatUSD(Number(a.invoiceUSD))}</td>
                            <td
                              className={`px-3 py-2 text-right tabular-nums ${rowVariance < 0 ? "text-destructive" : "text-muted-foreground"}`}
                            >
                              {formatUSD(rowVariance)}
                            </td>
                          </tr>
                        );
                      })}
                  </Fragment>
                );
              })}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    No activities match your search.
                  </td>
                </tr>
              )}
            </tbody>
            {groups.length > 0 && (
              <tfoot>
                <tr className="border-t-2 bg-muted/50 font-semibold">
                  <td className="px-2 py-2.5" colSpan={3}>
                    Total ({filtered.length} activities)
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatUSD(totals.estimateUSD)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatUSD(totals.actualUSD)}</td>
                  <td
                    className={`px-3 py-2.5 text-right tabular-nums ${
                      totals.estimateUSD - totals.actualUSD < 0 ? "text-destructive" : "text-green-600"
                    }`}
                  >
                    {formatUSD(totals.estimateUSD - totals.actualUSD)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
