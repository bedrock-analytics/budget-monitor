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

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const monthAgo = getBangkokDate(-29);

    const [users, lastActive, activeDays] = await Promise.all([
      db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          dateOfBirth: true,
          department: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.userActivity.groupBy({
        by: ["userId"],
        _max: { date: true },
      }),
      db.userActivity.groupBy({
        by: ["userId"],
        where: { date: { gte: monthAgo } },
        _count: { date: true },
      }),
    ]);

    const lastActiveMap = new Map(lastActive.map((r) => [r.userId, r._max.date]));
    const activeDaysMap = new Map(activeDays.map((r) => [r.userId, r._count.date]));

    const rows = users.map((u) => ({
      ...u,
      lastActiveAt: lastActiveMap.get(u.id) ?? null,
      activeDaysLast30: activeDaysMap.get(u.id) ?? 0,
    }));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
