export type StudioMode = "text" | "image" | "edit" | "remove-bg" | "upscale" | "background" | "batch" | "video-text" | "video-image";
export type ResolutionTier = "1k" | "2k" | "4k";

export const modePricing: Record<StudioMode, { label: string; baseCost: number; description: string }> = {
  text: { label: "文生图", baseCost: 12, description: "根据提示词生成图片" },
  image: { label: "图生图", baseCost: 16, description: "上传参考图后重绘" },
  edit: { label: "局部编辑", baseCost: 18, description: "选中局部区域后修改" },
  "remove-bg": { label: "去背景", baseCost: 5, description: "快速抠出主体" },
  upscale: { label: "图片放大", baseCost: 8, description: "提升清晰度和细节" },
  background: { label: "换背景", baseCost: 14, description: "保留主体替换场景" },
  batch: { label: "批量一致性", baseCost: 20, description: "适合角色和分镜批量生成" },
  "video-text": { label: "文生视频", baseCost: 0, description: "根据文字描述生成视频" },
  "video-image": { label: "图生视频", baseCost: 0, description: "根据图片生成视频" },
};

export const resolutionMultipliers: Record<ResolutionTier, number> = {
  "1k": 1,
  "2k": 1.5,
  "4k": 2.2,
};

export function estimateCredits(mode: StudioMode, resolution: ResolutionTier, count: number) {
  const base = modePricing[mode].baseCost;
  const multiplier = resolutionMultipliers[resolution];
  return Math.ceil(base * multiplier * Math.max(1, count));
}
