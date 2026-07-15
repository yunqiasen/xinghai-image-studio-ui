import { describe, expect, it } from "vitest";

import { buildModePrompt } from "./mode-request";

const settings = {
  imageEditAction: "add-text" as const,
  superAction: "4x" as const,
  referenceStrength: 72,
  preserveComposition: true,
  consistency: 86,
  variation: 24,
  overlayText: "星海新品",
};

describe("buildModePrompt", () => {
  it("keeps text generation prompt unchanged", () => {
    expect(buildModePrompt("text", "星港夜景", settings)).toBe("星港夜景");
  });

  it("adds image-to-image controls as explicit instructions", () => {
    expect(buildModePrompt("image", "改成电影感", settings)).toContain("参考强度 72%");
    expect(buildModePrompt("image", "改成电影感", settings)).toContain("保持原图构图");
  });

  it("maps image editing and super-resolution selections", () => {
    expect(buildModePrompt("remove-bg", "商业海报", settings)).toContain("添加文字“星海新品”");
    expect(buildModePrompt("upscale", "保持自然", settings)).toContain("4× 超分");
  });
});
