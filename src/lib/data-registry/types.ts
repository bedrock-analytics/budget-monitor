import type { ImportMode } from "@/lib/import-validation";

export interface DatasetProvider {
  key: string;
  label: string;
  description?: string;
  minRole: "MANAGER" | "ADMIN";
  accepts: string[];
  supportsReplace: boolean;
  count(): Promise<number>;
  keys?(): Promise<string[]>;
  sample(limit: number): Promise<unknown[]>;
  // Contract: never throws for expected/recoverable failures (bad file, no rows, etc.) --
  // return them in `errors` instead, so the generic route can always render a preview.
  parse(file: File): Promise<{ rows: unknown[]; errors: string[]; meta?: unknown }>;
  // `filename` isn't in the spec sketch, but the audit write has to happen inside the same
  // transaction as the data write (proven atomic in M4) -- it can't be bolted on by the
  // caller afterward, so apply() needs it to build that AuditLog row itself.
  apply(
    rows: unknown[],
    mode: ImportMode,
    actorId: string,
    filename: string,
    meta?: unknown,
  ): Promise<{ affected: number }>;
  clear?(actorId: string): Promise<{ affected: number }>;
}
