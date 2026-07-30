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

describe("structured studio requests", () => {
  it("keeps operation parameters out of the user prompt", () => {
    expect(buildModePrompt("image", "改成电影感", settings)).toBe("改成电影感");
    expect(buildModePrompt("remove-bg", "商业海报", settings)).toBe("商业海报");
    expect(buildModePrompt("upscale", "保持自然", settings)).toBe("保持自然");
    expect(buildModePrompt("batch", "连续分镜", settings)).toBe("连续分镜");
  });

  it("keeps masked edit instructions unchanged", () => {
    expect(buildGenerationPrompt("image", "把选区完整替换成汉堡", settings, true)).toBe("把选区完整替换成汉堡");
  });
});
