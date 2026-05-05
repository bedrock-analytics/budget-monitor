import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function getChatForUser(chatId: string, userId: string) {
  return db.chat.findFirst({
    where: { id: chatId, userId },
    select: { id: true, title: true },
  });
}

export async function GET(_: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;
  const chat = await getChatForUser(chatId, user.id);
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

export async function POST(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId } = await params;

  const chat = await getChatForUser(chatId, user.id);
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = CreateMessageSchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

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
  let chatPayload = { updatedAt: new Date(), title: chat.title };
  if (!chat.title) {
    chatPayload = { ...chatPayload, title: body.data.message };
  }
  await db.chat.update({
    where: { id: chatId },
    data: chatPayload,
    select: { id: true },
  });

  return NextResponse.json({ message }, { status: 201 });
}
