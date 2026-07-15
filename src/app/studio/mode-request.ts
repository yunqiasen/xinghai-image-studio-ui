import type { StudioMode } from "@/lib/billing/pricing";

import { imageEditActions, superResolutionActions } from "./mode-config";
import type { StudioSettingsValue } from "./mode-settings";

export type ModeRequestSettings = Pick<StudioSettingsValue, "imageEditAction" | "superAction" | "referenceStrength" | "preserveComposition" | "consistency" | "variation" | "overlayText">;

export function buildModePrompt(mode: StudioMode, prompt: string, settings: ModeRequestSettings) {
  const base = prompt.trim();
  const instructions: string[] = [];

  if (mode === "image") {
    instructions.push(`参考强度 ${settings.referenceStrength}%`);
    if (settings.preserveComposition) instructions.push("保持原图构图、主体位置和主要视觉结构");
  }
  if (mode === "edit") instructions.push("只修改遮罩区域，遮罩外内容保持不变");
  if (mode === "remove-bg") {
    const action = imageEditActions.find((item) => item.value === settings.imageEditAction)?.value;
    if (action === "remove-background") instructions.push("移除背景并保留主体边缘");
    if (action === "replace-background") instructions.push("只替换背景，保持主体完整");
    if (action === "change-clothes") instructions.push("只修改人物服装，保持人物身份和姿势");
    if (action === "swap-face") instructions.push("只修改脸部并自然融合，保持姿势和背景");
    if (action === "add-text" && settings.overlayText.trim()) instructions.push(`添加文字“${settings.overlayText.trim()}”`);
  }
  if (mode === "upscale") {
    const action = superResolutionActions.find((item) => item.value === settings.superAction)?.value;
    if (action === "2x" || action === "4x") instructions.push(`${action === "2x" ? "2×" : "4×"} 超分，提升清晰度和纹理细节`);
    if (action === "variation") instructions.push("生成保持主体和风格一致的图片变体");
    if (action === "restore-photo") instructions.push("修复老照片划痕、褪色、噪点和模糊");
    if (action === "face-enhance") instructions.push("增强人脸清晰度并保持五官身份");
  }
  if (mode === "batch") {
    instructions.push(`角色一致性 ${settings.consistency}%`);
    instructions.push(`构图变化 ${settings.variation}%`);
  }

  return [base, ...instructions].filter(Boolean).join("\n\n");
}
