import type { ImageModel, ImageOperation, ImageQuality, ImageResolution } from "./types";

export function estimateImageCredits(
  model: ImageModel | undefined,
  operation: ImageOperation,
  resolution: ImageResolution,
  quality: ImageQuality,
  count: number,
) {
  if (!model) return 0;
  const operationCost = model.pricing.operation_costs?.[operation] ?? model.pricing.default_cost;
  const resolutionCost = model.pricing.resolution_surcharges?.[resolution] ?? 0;
  const qualityCost = model.pricing.quality_surcharges?.[quality] ?? 0;
  return Math.max(1, operationCost + resolutionCost + qualityCost) * Math.max(1, count);
}
