import type { StudioMode } from "@/lib/billing/pricing";
import type { ImageOperation, ImageOperationOptions, ImageSourceRole } from "@/lib/image-models/types";

import type { StudioSettingsValue } from "./mode-settings";

export function resolveStudioOperation(mode: StudioMode, settings: StudioSettingsValue, hasMask: boolean): ImageOperation {
  if (mode === "text") return "generate";
  if (mode === "image" || mode === "edit") return hasMask ? "inpaint" : "img2img";
  if (mode === "batch") return "batch_consistency";
  if (mode === "background") return "background_replace";
  if (mode === "remove-bg") {
    return {
      "remove-background": "cutout",
      "replace-background": "background_replace",
      "change-clothes": "clothes_replace",
      "swap-face": "face_swap",
      "add-text": "text_overlay",
    }[settings.imageEditAction] as ImageOperation;
  }
  return {
    "2x": "upscale",
    "4x": "upscale",
    variation: "variation",
    "restore-photo": "restore_photo",
    "face-enhance": "face_enhance",
  }[settings.superAction] as ImageOperation;
}

export function buildStudioTaskOptions(operation: ImageOperation, settings: StudioSettingsValue): ImageOperationOptions {
  switch (operation) {
    case "img2img":
    case "clothes_replace":
    case "face_swap":
      return {
        referenceStrength: settings.referenceStrength,
        preserveComposition: settings.preserveComposition,
      };
    case "upscale":
      return { scale: settings.superAction === "4x" ? 4 : 2 };
    case "variation":
      return { variation: settings.variation };
    case "batch_consistency":
      return { consistency: settings.consistency, variation: settings.variation };
    case "text_overlay":
      return {
        text: settings.overlayText.trim(),
        fontFamily: "sans",
        fontSize: settings.fontSize,
        textColor: settings.textColor,
        position: settings.textPosition,
        x: settings.textPosition === "custom" ? settings.textX : 0,
        y: settings.textPosition === "custom" ? settings.textY : 0,
      };
    case "cutout":
      return { tolerance: settings.cutoutTolerance, feather: settings.cutoutFeather };
    case "background_replace":
      return { autoCutout: settings.autoCutout };
    default:
      return {};
  }
}

export function requiredAuxiliaryRole(operation: ImageOperation): ImageSourceRole | undefined {
  if (operation === "clothes_replace") return "garment";
  if (operation === "face_swap") return "face";
  if (operation === "background_replace") return "background";
  return undefined;
}

export function normalizeStudioCount(operation: ImageOperation, requested: number, maxOutputs = 4) {
  if (["inpaint", "cutout", "background_replace", "clothes_replace", "face_swap", "text_overlay", "face_enhance", "upscale", "restore_photo"].includes(operation)) return 1;
  const allowed = operation === "batch_consistency" ? [2, 4] : [1, 2, 4];
  const capped = allowed.filter((value) => value <= Math.max(1, maxOutputs));
  const candidates = capped.length ? capped : [1];
  return candidates.reduce((best, value) => Math.abs(value - requested) < Math.abs(best - requested) ? value : best, candidates[0]);
}

export type StudioValidationError = "source" | "prompt" | "mask" | "garment" | "face" | "background" | "text";

type SubmissionAsset = { role: ImageSourceRole };

export function validateStudioSubmission(
  operation: ImageOperation,
  assets: SubmissionAsset[],
  settings: StudioSettingsValue,
  prompt: string,
): StudioValidationError | undefined {
  const has = (role: ImageSourceRole) => assets.some((asset) => asset.role === role);
  if (operation !== "generate" && !has("image")) return "source";
  if (["generate", "img2img", "inpaint"].includes(operation) && !prompt.trim()) return "prompt";
  if (operation === "inpaint" && !has("mask")) return "mask";
  if (operation === "clothes_replace" && !has("garment")) return "garment";
  if (operation === "face_swap" && !has("face")) return "face";
  if (operation === "background_replace" && !has("background") && !settings.backgroundDescription.trim() && !prompt.trim()) return "background";
  if (operation === "text_overlay" && !settings.overlayText.trim()) return "text";
  return undefined;
}
