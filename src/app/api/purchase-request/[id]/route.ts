import { NextResponse } from "next/server";

import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

import { db } from "@/lib/db";
import { toNumber } from "@/lib/purchase-request";
import { S3_BUCKET, s3 } from "@/lib/s3";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pr = await db.purchaseRequest.findUnique({
      where: { id },
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

    if (!pr) {
      return NextResponse.json({ error: "Purchase request not found" }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Failed to fetch purchase request:", error);
    return NextResponse.json({ error: "Failed to fetch purchase request" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      orderType,
      title,
      description,
      department,
      currency,
      notes,
      dueDate,
      deliveryTo,
      proposedStrategy,
      businessJustification,
      budgetId,
      items,
      newAttachments,
    } = body;

    const existing = await db.purchaseRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Purchase request not found" }, { status: 404 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json({ error: "Only DRAFT purchase requests can be edited" }, { status: 400 });
    }

    const totalAmount = items
      ? items.reduce(
          (sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice,
          0,
        )
      : undefined;

    const pr = await db.purchaseRequest.update({
      where: { id },
      data: {
        ...(orderType && { orderType }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(department !== undefined && { department }),
        ...(currency && { currency }),
        ...(notes !== undefined && { notes }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(deliveryTo !== undefined && { deliveryTo: deliveryTo || null }),
        ...(proposedStrategy !== undefined && { proposedStrategy: proposedStrategy || null }),
        ...(proposedStrategy !== undefined && {
          businessJustification: proposedStrategy === "DIRECT_NEGOTIATION" ? businessJustification || null : null,
        }),
        ...(budgetId !== undefined && { budgetId: budgetId || null }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item: { description: string; quantity: number; unit: string; unitPrice: number }) => ({
              description: item.description,
              quantity: item.quantity,
              unit: item.unit || "EA",
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          },
        }),
        ...(Array.isArray(newAttachments) &&
          newAttachments.length > 0 && {
            attachments: {
              create: newAttachments.map(
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

    return NextResponse.json(pr);
  } catch (error) {
    console.error("Failed to update purchase request:", error);
    return NextResponse.json({ error: "Failed to update purchase request" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: "Purchase request not found" }, { status: 404 });
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
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await db.purchaseRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Purchase request not found" }, { status: 404 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json({ error: "Only DRAFT purchase requests can be deleted" }, { status: 400 });
    }

    const attachments = await db.purchaseRequestAttachment.findMany({
      where: { purchaseRequestId: id },
      select: { fileKey: true },
    });

    if (attachments.length > 0 && S3_BUCKET) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: S3_BUCKET,
          Delete: { Objects: attachments.map((a) => ({ Key: a.fileKey })) },
        }),
      );
    }

    await db.purchaseRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete purchase request:", error);
    return NextResponse.json({ error: "Failed to delete purchase request" }, { status: 500 });
  }
}
