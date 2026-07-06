import { NextResponse } from "next/server";

import { requireRole } from "@/lib/authz";
import { datasetRegistry } from "@/lib/data-registry/registry";
import { db } from "@/lib/db";

function importAndClearActions(): string[] {
  return ["data.import", "data.clear", ...datasetRegistry.map((p) => `${p.key}.import`)];
}

export async function GET() {
  try {
    const auth = await requireRole("MANAGER");
    if (auth instanceof NextResponse) return auth;

    const [providers, historyRows] = await Promise.all([
      Promise.all(
        datasetRegistry.map(async (provider) => {
          const [count, keys, lastImport] = await Promise.all([
            provider.count(),
            provider.keys?.(),
            db.auditLog.findFirst({
              where: { target: provider.key, action: { in: ["data.import", `${provider.key}.import`] } },
              orderBy: { createdAt: "desc" },
              include: { actor: { select: { email: true, name: true } } },
            }),
          ]);

          return {
            key: provider.key,
            label: provider.label,
            description: provider.description ?? null,
            minRole: provider.minRole,
            accepts: provider.accepts,
            supportsReplace: provider.supportsReplace,
            canClear: !!provider.clear,
            count,
            keys: keys ?? null,
            lastImport: lastImport
              ? { actor: lastImport.actor.name ?? lastImport.actor.email, at: lastImport.createdAt }
              : null,
          };
        }),
      ),
      db.auditLog.findMany({
        where: {
          target: { in: datasetRegistry.map((p) => p.key) },
          action: { in: importAndClearActions() },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { actor: { select: { email: true, name: true } } },
      }),
    ]);

    const history = historyRows.map((row) => ({
      id: row.id,
      actor: row.actor.name ?? row.actor.email,
      action: row.action,
      target: row.target,
      createdAt: row.createdAt,
      metadata: row.metadata,
    }));

    return NextResponse.json({ providers, history });
  } catch (error) {
    console.error("Failed to load data registry:", error);
    return NextResponse.json({ error: "Failed to load datasets" }, { status: 500 });
  }
}
