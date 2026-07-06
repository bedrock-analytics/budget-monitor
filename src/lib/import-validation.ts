export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_IMPORT_ROWS = 20_000;

export function validateImportFile(file: File, allowedExtensions: string[]): string | null {
  if (file.size === 0) return "File is empty";
  if (file.size > MAX_IMPORT_FILE_SIZE) return "File exceeds 10 MB limit";

  const name = file.name.toLowerCase();
  if (!allowedExtensions.some((ext) => name.endsWith(ext))) {
    return `Unsupported file type; allowed: ${allowedExtensions.join(", ")}`;
  }
  return null;
}

export function checkRowCount(count: number): string | null {
  if (count > MAX_IMPORT_ROWS) {
    return `File has ${count} rows, exceeding the ${MAX_IMPORT_ROWS} row limit`;
  }
  return null;
}

export type ImportMode = "upsert" | "replace";

export function parseImportMode(value: string | null): ImportMode {
  return value === "replace" ? "replace" : "upsert";
}
