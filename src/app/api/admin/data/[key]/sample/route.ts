import { NextResponse } from "next/server";

import { hasRole, requireRole } from "@/lib/authz";
import { getProvider } from "@/lib/data-registry/registry";

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const auth = await requireRole("MANAGER");
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { key } = await params;
    const provider = getProvider(key);
    if (!provider) return NextResponse.json({ error: "Unknown dataset" }, { status: 404 });
    if (!hasRole(user, provider.minRole)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20, 100);

    const rows = await provider.sample(limit);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Failed to sample dataset:", error);
    return NextResponse.json({ error: "Failed to load sample" }, { status: 500 });
  }
}
