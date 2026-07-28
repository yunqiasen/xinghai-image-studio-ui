import type { StudioAsset } from "./mode-settings";

export function createResultSourceAsset(url: string, sourceTaskId: string | undefined, sourceImageIndex: number): StudioAsset {
  return {
    id: `result-${sourceTaskId || Date.now()}-${sourceImageIndex}`,
    name: "生成结果",
    dataUrl: "",
    url,
    role: "image",
    sourceTaskId,
    sourceImageIndex,
  };
}

export function parentEditContext(sourceItems: StudioAsset[]): { parentTaskId?: string; parentImageIndex?: number } {
  const source = sourceItems.find((item) => item.role === "image" && item.sourceTaskId);
  if (!source?.sourceTaskId) return {};
  return {
    parentTaskId: source.sourceTaskId,
    parentImageIndex: source.sourceImageIndex ?? 0,
  };
}
