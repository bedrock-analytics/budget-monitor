import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

import { v4 as uuidv4 } from "uuid";

async function requireChatForUser(chatId: string, email: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) return null;

  return db.chat.findFirst({
    where: { id: chatId, userId: user.id },
    select: { id: true },
  });
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;
  const chat = await requireChatForUser(chatId, email);
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await db.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      metadata: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ messages });
}

const CreateMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  message: z.string().min(1),
  metadata: z.unknown().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;

  const chat = await requireChatForUser(chatId, email);
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = CreateMessageSchema.safeParse(
    await req.json().catch(() => ({})),
  );
  if (!body.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const message = await db.message.create({
    data: {
      id: uuidv4(),
      chatId,
      role: body.data.role,
      content: body.data.message,
      metadata: body.data.metadata as never,
    },
    select: {
      id: true,
      role: true,
      content: true,
      metadata: true,
      createdAt: true,
    },
  });

  await db.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
    select: { id: true },
  });

  return NextResponse.json({ message }, { status: 201 });
}
