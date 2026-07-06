// biome-ignore lint/suspicious/noExplicitAny: dry-run/commit response shapes are dataset-specific, see ImportDialog
export function renderCostTrackingSummary(preview: any) {
  if (preview.rowCount === undefined) {
    return (
      <div className="flex flex-col gap-1">
        <span>Project: {preview.projectCode}</span>
        <span className="text-muted-foreground">
          Updates budget only: ${Number(preview.budgetUSD).toLocaleString()} across {preview.budgetItems} line items. No
          activity rows are touched.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <span>
        Project: {preview.projectName} ({preview.projectCode})
      </span>
      <span>{preview.rowCount} activity rows in file</span>
      {preview.isNewProject ? (
        <span className="text-muted-foreground">This creates a new project.</span>
      ) : (
        <span className="text-amber-600 dark:text-amber-500">
          This replaces all {preview.currentActivityCount} existing activities for this project with {preview.rowCount}{" "}
          new rows.
        </span>
      )}
    </div>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: dry-run/commit response shapes are dataset-specific, see ImportDialog
export function renderCostTrackingResult(result: any) {
  return (
    <span>
      {result.activities > 0
        ? `Imported ${result.activities} activities for ${result.projectCode}`
        : `Updated budget for ${result.projectCode}`}
    </span>
  );
}
