import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { generateInspectionNumber } from "@/lib/facility-quality-inspection";

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

export async function GET() {
  try {
    const data = await db.facilityQualityInspection.findMany({
      orderBy: { createdAt: "desc" },
      include: inspectionInclude,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch inspections:", error);
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inspectorId, facilityName, facilityLocation, inspectionType, inspectionDate, description, notes, items } =
      body;

    if (!inspectorId || !facilityName || !inspectionType || !inspectionDate) {
      return NextResponse.json(
        { error: "Inspector, facility name, inspection type, and date are required" },
        { status: 400 },
      );
    }

    const inspection = await db.facilityQualityInspection.create({
      data: {
        inspectionNumber: generateInspectionNumber(),
        inspectorId,
        facilityName,
        facilityLocation: facilityLocation || null,
        inspectionType,
        inspectionDate: new Date(inspectionDate),
        description: description || null,
        notes: notes || null,
        items: items?.length
          ? {
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
            }
          : undefined,
      },
      include: inspectionInclude,
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error("Failed to create inspection:", error);
    return NextResponse.json({ error: "Failed to create inspection" }, { status: 500 });
  }
}
