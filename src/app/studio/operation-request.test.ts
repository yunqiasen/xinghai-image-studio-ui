import { describe, expect, it } from "vitest";

import type { StudioSettingsValue } from "./mode-settings";
import {
  buildStudioTaskOptions,
  normalizeStudioCount,
  resolveStudioOperation,
  requiredAuxiliaryRole,
  validateStudioSubmission,
} from "./operation-request";

const settings: StudioSettingsValue = {
  model: "Agnes-Image-2.1-Flash",
  aspectRatio: "1:1",
  count: 4,
  resolution: "2k",
  quality: "high",
  prompt: "",
  imageEditAction: "change-clothes",
  superAction: "variation",
  referenceStrength: 82,
  preserveComposition: true,
  consistency: 88,
  variation: 24,
  overlayText: "星海新品",
  fontFamily: "sans",
  fontSize: 72,
  textColor: "#FFEECC",
  textPosition: "bottom-center",
  textX: 0,
  textY: 0,
  cutoutTolerance: 42,
  cutoutFeather: 18,
  autoCutout: true,
  style: "商业摄影",
  backgroundDescription: "夜间城市街景",
};

describe("studio operation request mapping", () => {
  it("maps every studio workflow to the documented backend operation", () => {
    expect(resolveStudioOperation("text", settings, false)).toBe("generate");
    expect(resolveStudioOperation("image", settings, false)).toBe("img2img");
    expect(resolveStudioOperation("image", settings, true)).toBe("inpaint");
    expect(resolveStudioOperation("remove-bg", { ...settings, imageEditAction: "remove-background" }, false)).toBe("cutout");
    expect(resolveStudioOperation("remove-bg", { ...settings, imageEditAction: "replace-background" }, false)).toBe("background_replace");
    expect(resolveStudioOperation("remove-bg", { ...settings, imageEditAction: "change-clothes" }, false)).toBe("clothes_replace");
    expect(resolveStudioOperation("remove-bg", { ...settings, imageEditAction: "swap-face" }, false)).toBe("face_swap");
    expect(resolveStudioOperation("remove-bg", { ...settings, imageEditAction: "add-text" }, false)).toBe("text_overlay");
    expect(resolveStudioOperation("upscale", { ...settings, superAction: "2x" }, false)).toBe("upscale");
    expect(resolveStudioOperation("upscale", { ...settings, superAction: "variation" }, false)).toBe("variation");
    expect(resolveStudioOperation("upscale", { ...settings, superAction: "restore-photo" }, false)).toBe("restore_photo");
    expect(resolveStudioOperation("upscale", { ...settings, superAction: "face-enhance" }, false)).toBe("face_enhance");
    expect(resolveStudioOperation("batch", settings, false)).toBe("batch_consistency");
  });

  it("builds structured operation options instead of prompt-only instructions", () => {
    expect(buildStudioTaskOptions("clothes_replace", settings)).toMatchObject({
      referenceStrength: 82,
      preserveComposition: true,
    });
    expect(buildStudioTaskOptions("text_overlay", settings)).toMatchObject({
      text: "星海新品",
      fontFamily: "sans",
      fontSize: 72,
      textColor: "#FFEECC",
      position: "bottom-center",
    });
    expect(buildStudioTaskOptions("batch_consistency", settings)).toMatchObject({
      consistency: 88,
      variation: 24,
    });
    expect(buildStudioTaskOptions("cutout", settings)).toMatchObject({ tolerance: 42, feather: 18 });
  });

  it("requires role-specific reference images and operation-specific counts", () => {
    expect(requiredAuxiliaryRole("clothes_replace")).toBe("garment");
    expect(requiredAuxiliaryRole("face_swap")).toBe("face");
    expect(requiredAuxiliaryRole("background_replace")).toBe("background");
    expect(normalizeStudioCount("batch_consistency", 1, 4)).toBe(2);
    expect(normalizeStudioCount("inpaint", 4, 4)).toBe(1);
    expect(normalizeStudioCount("variation", 4, 2)).toBe(2);
  });

  it("validates role-specific inputs before spending credits", () => {
    const image = { id: "image", name: "target.png", dataUrl: "data:image/png;base64,AA==", url: "", role: "image" as const };
    expect(validateStudioSubmission("clothes_replace", [image], settings, "")).toBe("garment");
    expect(validateStudioSubmission("face_swap", [image], settings, "")).toBe("face");
    expect(validateStudioSubmission("background_replace", [image], { ...settings, backgroundDescription: "" }, "")).toBe("background");
    expect(validateStudioSubmission("text_overlay", [image], { ...settings, overlayText: "" }, "")).toBe("text");
    expect(validateStudioSubmission("inpaint", [image], settings, "替换选区")).toBe("mask");
    expect(validateStudioSubmission("img2img", [image], settings, "")).toBe("prompt");
    expect(validateStudioSubmission("variation", [image], settings, "")).toBeUndefined();
  });

});
