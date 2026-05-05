import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

function getBangkokDate(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000));
  return new Date(`${parts}T00:00:00.000Z`);
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const today = getBangkokDate(0);
    const weekAgo = getBangkokDate(-6);
    const monthAgo = getBangkokDate(-29);

    const [totalUsers, activeToday, activeWeek, activeMonth, rawDaily] = await Promise.all([
      db.user.count(),
      db.userActivity.findMany({
        where: { date: today },
        select: { userId: true },
        distinct: ["userId"],
      }),
      db.userActivity.findMany({
        where: { date: { gte: weekAgo } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      db.userActivity.findMany({
        where: { date: { gte: monthAgo } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      db.userActivity.groupBy({
        by: ["date"],
        where: { date: { gte: monthAgo } },
        _count: { userId: true },
        orderBy: { date: "asc" },
      }),
    ]);

    const dailyMap = new Map(rawDaily.map((r) => [formatDate(r.date), r._count.userId]));
    const daily: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = getBangkokDate(-i);
      const key = formatDate(d);
      daily.push({ date: key, count: dailyMap.get(key) ?? 0 });
    }

    return NextResponse.json({
      totalUsers,
      dau: activeToday.length,
      wau: activeWeek.length,
      mau: activeMonth.length,
      daily,
    });
  } catch (error) {
    console.error("Failed to fetch activity summary:", error);
    return NextResponse.json({ error: "Failed to fetch activity summary" }, { status: 500 });
  }
}
