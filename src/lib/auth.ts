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

export async function requireUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

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

  await recordDailyActivity(user.id);

  return user;
}
