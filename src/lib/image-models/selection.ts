import type { ImageModel, ImageOperation } from "./types";

export function imageModelsForOperation(models: ImageModel[], operation: ImageOperation) {
  return models.filter((model) => model.runtimeReady && model.capabilities.operations.includes(operation));
}

export function selectImageModel(models: ImageModel[], operation: ImageOperation, currentModel: string) {
  const candidates = imageModelsForOperation(models, operation);
  return candidates.find((model) => model.id === currentModel || model.slug === currentModel) || candidates[0];
}

export function availableImageOperations(models: ImageModel[]) {
  return Array.from(new Set(models.flatMap((model) => model.runtimeReady ? model.capabilities.operations : [])));
}
