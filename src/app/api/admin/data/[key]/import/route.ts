import { NextResponse } from "next/server";

import { hasRole, requireRole } from "@/lib/authz";
import { getProvider } from "@/lib/data-registry/registry";
import { parseImportMode, validateImportFile } from "@/lib/import-validation";

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const auth = await requireRole("MANAGER");
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { key } = await params;
    const provider = getProvider(key);
    if (!provider) return NextResponse.json({ error: "Unknown dataset" }, { status: 404 });
    if (!hasRole(user, provider.minRole)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(request.url);
    const mode = parseImportMode(url.searchParams.get("mode"));
    const dryRun = url.searchParams.get("dryRun") === "1";

    if (mode === "replace") {
      if (!provider.supportsReplace) {
        return NextResponse.json({ error: "This dataset does not support replace mode" }, { status: 400 });
      }
      if (!hasRole(user, "ADMIN")) {
        return NextResponse.json({ error: "Replace mode requires ADMIN" }, { status: 403 });
      }
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const fileObj = file as File;

    const fileError = validateImportFile(
      fileObj,
      provider.accepts.map((ext) => `.${ext}`),
    );
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });

    const { rows, errors, meta } = await provider.parse(fileObj);

    if (dryRun) {
      const currentCount = await provider.count();
      return NextResponse.json({ dryRun: true, mode, rowCount: rows.length, currentCount, errors });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const { affected } = await provider.apply(rows, mode, user.id, fileObj.name, meta);
    return NextResponse.json({ imported: affected, mode, key });
  } catch (error) {
    console.error("Failed to import dataset:", error);
    return NextResponse.json({ error: "Failed to import data" }, { status: 500 });
  }
}
