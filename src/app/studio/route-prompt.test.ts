import { describe, expect, it } from "vitest";

import { MAX_STUDIO_PROMPT_LENGTH, readStudioRoutePrompt, readStudioRouteState } from "./route-prompt";

describe("studio route prompt", () => {
  it("accepts a non-empty prompt from router state", () => {
    expect(readStudioRoutePrompt({ prompt: "  星港远航，电影级构图  " })).toBe("星港远航，电影级构图");
  });

  it("ignores malformed route state", () => {
    expect(readStudioRoutePrompt(null)).toBeNull();
    expect(readStudioRoutePrompt({})).toBeNull();
    expect(readStudioRoutePrompt({ prompt: "   " })).toBeNull();
    expect(readStudioRoutePrompt({ prompt: 42 })).toBeNull();
  });

  it("caps imported templates at the supported editor length", () => {
    expect(MAX_STUDIO_PROMPT_LENGTH).toBe(4000);
    expect(readStudioRoutePrompt({ prompt: "a".repeat(4100) })).toHaveLength(4000);
  });
});


describe("studio route source state", () => {
  it("normalizes a gallery source into image-to-image state", () => {
    expect(readStudioRouteState({
      mode: "image",
      prompt: "保留主体，改变背景",
      sourceImage: { url: "/p/img/task/0", name: "作品 1", sourceTaskId: "task", sourceImageIndex: 0 },
    })).toEqual({
      mode: "image",
      prompt: "保留主体，改变背景",
      sourceImage: { url: "/p/img/task/0", name: "作品 1", sourceTaskId: "task", sourceImageIndex: 0 },
    });
  });

  it("keeps local editing inside image-to-image for current and legacy route states", () => {
    for (const mode of ["image", "edit"]) {
      expect(readStudioRouteState({
        mode,
        sourceImage: { url: "/p/img/task/0" },
        openMaskEditor: true,
      })).toEqual({
        mode: "image",
        prompt: "",
        sourceImage: { url: "/p/img/task/0", name: "作品" },
        openMaskEditor: true,
      });
    }
  });
});
