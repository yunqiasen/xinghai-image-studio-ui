import { describe, expect, it } from "vitest";

import { buildGenerationPrompt, buildModePrompt } from "./mode-request";

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

it("keeps a masked edit prompt free of generic image-to-image constraints", () => {
  expect(buildGenerationPrompt("image", "把选区完整替换成汉堡", settings, true)).toBe("把选区完整替换成汉堡");
});
