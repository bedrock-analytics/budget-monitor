import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

import { v4 as uuidv4 } from "uuid";

async function getOrCreateUserByEmail(
  email: string,
  name?: string | null,
  image?: string | null,
) {
  return db.user.upsert({
    where: { email },
    update: {
      name: name ?? undefined,
      image: image ?? undefined,
    },
    create: {
      email,
      name: name ?? undefined,
      image: image ?? undefined,
    },
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUserByEmail(
    email,
    session.user?.name,
    session.user?.image,
  );

  const chats = await db.chat.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({ chats });
}

const CreateChatSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = CreateChatSchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const user = await getOrCreateUserByEmail(
    email,
    session.user?.name,
    session.user?.image,
  );

  const chat = await db.chat.create({
    data: {
      // id: uuidv4(),
      userId: user.id,
      title: body.data.title,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ chat }, { status: 201 });
}
