import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { requireRole } from "@/lib/authz";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await params;
    const project = await db.costTrackingProject.findUnique({
      where: { projectCode: decodeURIComponent(code) },
      include: {
        activities: { orderBy: { position: "asc" } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to load cost tracking project:", error);
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const auth = await requireRole("MANAGER");
    if (auth instanceof NextResponse) return auth;

    const { code } = await params;
    await db.costTrackingProject.delete({
      where: { projectCode: decodeURIComponent(code) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete cost tracking project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
