import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { assertOwnership } from "@/lib/authz";
import { db } from "@/lib/db";

const inspectionInclude = {
  inspector: { select: { id: true, name: true, email: true } },
  items: {
    select: {
      id: true,
      category: true,
      checkItem: true,
      result: true,
      priority: true,
      correctiveAction: true,
      actionParty: true,
      remarks: true,
    },
  },
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const inspection = await db.facilityQualityInspection.findUnique({
      where: { id },
      include: inspectionInclude,
    });

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Failed to fetch inspection:", error);
    return NextResponse.json({ error: "Failed to fetch inspection" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { facilityName, facilityLocation, inspectionType, inspectionDate, description, notes, items } = body;

    const existing = await db.facilityQualityInspection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }
    if (!assertOwnership(existing.inspectorId, user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json({ error: "Only DRAFT inspections can be edited" }, { status: 400 });
    }

    const inspection = await db.facilityQualityInspection.update({
      where: { id },
      data: {
        ...(facilityName && { facilityName }),
        ...(facilityLocation !== undefined && { facilityLocation }),
        ...(inspectionType && { inspectionType }),
        ...(inspectionDate && { inspectionDate: new Date(inspectionDate) }),
        ...(description !== undefined && { description }),
        ...(notes !== undefined && { notes }),
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map(
              (item: {
                category: string;
                checkItem: string;
                result?: string;
                priority?: string;
                correctiveAction?: string;
                actionParty?: string;
                remarks?: string;
              }) => ({
                category: item.category,
                checkItem: item.checkItem,
                result: item.result || "PENDING",
                priority: item.priority || null,
                correctiveAction: item.correctiveAction || null,
                actionParty: item.actionParty || null,
                remarks: item.remarks || null,
              }),
            ),
          },
        }),
      },
      include: inspectionInclude,
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Failed to update inspection:", error);
    return NextResponse.json({ error: "Failed to update inspection" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { status, overallResult } = body;

    const existing = await db.facilityQualityInspection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }
    if (!assertOwnership(existing.inspectorId, user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status) {
      const validTransitions: Record<string, string[]> = {
        DRAFT: ["SCHEDULED", "IN_PROGRESS"],
        SCHEDULED: ["IN_PROGRESS", "DRAFT"],
        IN_PROGRESS: ["COMPLETED"],
        COMPLETED: ["APPROVED", "REJECTED"],
        REJECTED: ["DRAFT"],
      };

      const allowed = validTransitions[existing.status];
      if (!allowed?.includes(status)) {
        return NextResponse.json({ error: `Cannot transition from ${existing.status} to ${status}` }, { status: 400 });
      }
    }

    const now = new Date();
    const inspection = await db.facilityQualityInspection.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(overallResult && { overallResult }),
        ...(status === "SCHEDULED" && { scheduledAt: now }),
        ...(status === "COMPLETED" && { completedAt: now }),
        ...(status === "APPROVED" && { approvedAt: now }),
        ...(status === "REJECTED" && { rejectedAt: now }),
      },
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Failed to update inspection status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await db.facilityQualityInspection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }
    if (!assertOwnership(existing.inspectorId, user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json({ error: "Only DRAFT inspections can be deleted" }, { status: 400 });
    }

    await db.facilityQualityInspection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete inspection:", error);
    return NextResponse.json({ error: "Failed to delete inspection" }, { status: 500 });
  }
}
