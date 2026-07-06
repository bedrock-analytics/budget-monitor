import type { User } from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

function getBangkokDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${parts}T00:00:00.000Z`);
}

async function recordDailyActivity(userId: string) {
  try {
    await db.userActivity.upsert({
      where: { userId_date: { userId, date: getBangkokDate() } },
      create: { userId, date: getBangkokDate() },
      update: {},
    });
  } catch (error) {
    console.error("Failed to record user activity:", error);
  }
}

export type ResolvedUser =
  | { status: "unauthenticated" }
  | { status: "inactive"; user: User }
  | { status: "ok"; user: User };

export async function resolveUser(): Promise<ResolvedUser> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return { status: "unauthenticated" };

  const user = await db.user.upsert({
    where: { email },
    update: {
      name: session.user?.name ?? undefined,
      image: session.user?.image ?? undefined,
    },
    create: {
      email,
      name: session.user?.name ?? undefined,
      image: session.user?.image ?? undefined,
    },
  });

  if (!user.isActive) return { status: "inactive", user };

  await recordDailyActivity(user.id);

  return { status: "ok", user };
}

export async function requireUser() {
  const result = await resolveUser();
  return result.status === "ok" ? result.user : null;
}
