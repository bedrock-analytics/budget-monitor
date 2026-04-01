import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: { id: true, name: true, email: true, phone: true, dateOfBirth: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
