import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { generatePRNumber, toNumber } from "@/lib/purchase-request";

export async function GET() {
  try {
    const data = await db.purchaseRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        budget: {
          select: {
            id: true,
            projectTypeName: true,
            budgetItemName: true,
            availableTHB: true,
            availableUSD: true,
          },
        },
        items: true,
        attachments: true,
      },
    });

    const rows = data.map((pr: any) => ({
      ...pr,
      totalAmount: toNumber(pr.totalAmount),
      budget: pr.budget
        ? {
            ...pr.budget,
            availableTHB: toNumber(pr.budget.availableTHB),
            availableUSD: toNumber(pr.budget.availableUSD),
          }
        : null,
      items: pr.items.map((item: any) => ({
        ...item,
        unitPrice: toNumber(item.unitPrice),
        totalPrice: toNumber(item.totalPrice),
      })),
    }));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch purchase requests:", error);
    return NextResponse.json({ error: "Failed to fetch purchase requests" }, { status: 500 });
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
      dueDate,
      deliveryTo,
      proposedStrategy,
      businessJustification,
      budgetId,
      items,
      attachments,
    } = body;

    if (!title || !requesterId || !items?.length) {
      return NextResponse.json({ error: "Title, requester, and at least one item are required" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice,
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
        dueDate: dueDate ? new Date(dueDate) : null,
        deliveryTo: deliveryTo || null,
        proposedStrategy: proposedStrategy || null,
        businessJustification: proposedStrategy === "DIRECT_NEGOTIATION" ? businessJustification || null : null,
        budgetId: budgetId || null,
        items: {
          create: items.map((item: { description: string; quantity: number; unit: string; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || "EA",
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
        ...(Array.isArray(attachments) &&
          attachments.length > 0 && {
            attachments: {
              create: attachments.map(
                (a: { fileName: string; fileKey: string; fileSize: number; contentType: string }) => ({
                  fileName: a.fileName,
                  fileKey: a.fileKey,
                  fileSize: a.fileSize,
                  contentType: a.contentType,
                }),
              ),
            },
          }),
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        budget: {
          select: {
            id: true,
            projectTypeName: true,
            budgetItemName: true,
            availableTHB: true,
            availableUSD: true,
          },
        },
        items: true,
        attachments: true,
      },
    });

    return NextResponse.json(pr, { status: 201 });
  } catch (error) {
    console.error("Failed to create purchase request:", error);
    return NextResponse.json({ error: "Failed to create purchase request" }, { status: 500 });
  }
}
