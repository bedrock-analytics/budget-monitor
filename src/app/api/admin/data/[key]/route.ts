import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/authz";
import { getProvider } from "@/lib/data-registry/registry";

export async function DELETE(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { key } = await params;
    const provider = getProvider(key);
    if (!provider) return NextResponse.json({ error: "Unknown dataset" }, { status: 404 });
    if (!provider.clear) return NextResponse.json({ error: "This dataset does not support clearing" }, { status: 400 });

    const { affected } = await provider.clear(user.id);
    return NextResponse.json({ affected });
  } catch (error) {
    console.error("Failed to clear dataset:", error);
    return NextResponse.json({ error: "Failed to clear dataset" }, { status: 500 });
  }
}
