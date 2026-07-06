import { budgetProvider } from "@/lib/data-registry/providers/budget";
import { budgetDetailProvider } from "@/lib/data-registry/providers/budget-detail";
import { costTrackingProvider } from "@/lib/data-registry/providers/cost-tracking";
import type { DatasetProvider } from "@/lib/data-registry/types";

export const datasetRegistry: DatasetProvider[] = [budgetProvider, budgetDetailProvider, costTrackingProvider];

export function getProvider(key: string): DatasetProvider | undefined {
  return datasetRegistry.find((p) => p.key === key);
}
