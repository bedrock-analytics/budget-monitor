import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { toNumber } from "@/lib/purchase-request";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pr = await db.purchaseRequest.findUnique({
      where: { id },
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

    if (!pr) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Failed to fetch purchase request:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase request" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, department, currency, notes, items } = body;

    const existing = await db.purchaseRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 },
      );
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT purchase requests can be edited" },
        { status: 400 },
      );
    }

    const totalAmount = items
      ? items.reduce(
          (sum: number, item: { quantity: number; unitPrice: number }) =>
            sum + item.quantity * item.unitPrice,
          0,
        )
      : undefined;

    const pr = await db.purchaseRequest.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(department !== undefined && { department }),
        ...(currency && { currency }),
        ...(notes !== undefined && { notes }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(items && {
          items: {
            deleteMany: {},
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
        }),
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

    return NextResponse.json(pr);
  } catch (error) {
    console.error("Failed to update purchase request:", error);
    return NextResponse.json(
      { error: "Failed to update purchase request" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validTransitions: Record<string, string[]> = {
      DRAFT: ["SUBMITTED", "CANCELLED"],
      SUBMITTED: ["APPROVED", "REJECTED"],
      REJECTED: ["DRAFT"],
    };

    const existing = await db.purchaseRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 },
      );
    }

    const allowed = validTransitions[existing.status];
    if (!allowed?.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${existing.status} to ${status}`,
        },
        { status: 400 },
      );
    }

    const now = new Date();
    const pr = await db.purchaseRequest.update({
      where: { id },
      data: {
        status,
        ...(status === "SUBMITTED" && { submittedAt: now }),
        ...(status === "APPROVED" && { approvedAt: now }),
        ...(status === "REJECTED" && { rejectedAt: now }),
      },
    });

    return NextResponse.json(pr);
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.purchaseRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 },
      );
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT purchase requests can be deleted" },
        { status: 400 },
      );
    }

    await db.purchaseRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete purchase request:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase request" },
      { status: 500 },
    );
  }
}
