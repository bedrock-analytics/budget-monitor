import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { generatePRNumber, toNumber } from "@/lib/purchase-request";

export async function GET() {
  try {
    const data = await db.purchaseRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            budget: {
              select: {
                id: true,
                projectTypeName: true,
                budgetItemName: true,
                availableTHB: true,
                availableUSD: true,
              },
            },
          },
        },
      },
    });

    const rows = data.map((pr: any) => ({
      ...pr,
      totalAmount: toNumber(pr.totalAmount),
      items: pr.items.map((item: any) => ({
        ...item,
        unitPrice: toNumber(item.unitPrice),
        totalPrice: toNumber(item.totalPrice),
        budget: {
          ...item.budget,
          availableTHB: toNumber(item.budget.availableTHB),
          availableUSD: toNumber(item.budget.availableUSD),
        },
      })),
    }));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch purchase requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase requests" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      requesterId,
      department,
      currency,
      notes,
      items,
    } = body;

    if (!title || !requesterId || !items?.length) {
      return NextResponse.json(
        { error: "Title, requester, and at least one item are required" },
        { status: 400 },
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0,
    );

    const pr = await db.purchaseRequest.create({
      data: {
        prNumber: generatePRNumber(),
        title,
        description: description || null,
        requesterId,
        department: department || null,
        currency: currency || "THB",
        totalAmount,
        notes: notes || null,
        items: {
          create: items.map(
            (item: {
              budgetId: string;
              description: string;
              quantity: number;
              unit: string;
              unitPrice: number;
            }) => ({
              budgetId: item.budgetId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit || "EA",
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            }),
          ),
        },
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            budget: {
              select: {
                id: true,
                projectTypeName: true,
                budgetItemName: true,
                availableTHB: true,
                availableUSD: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(pr, { status: 201 });
  } catch (error) {
    console.error("Failed to create purchase request:", error);
    return NextResponse.json(
      { error: "Failed to create purchase request" },
      { status: 500 },
    );
  }
}
