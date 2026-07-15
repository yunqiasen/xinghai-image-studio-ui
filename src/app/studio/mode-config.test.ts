import { describe, expect, it } from "vitest";

import {
  imageEditActions,
  studioModeDefinitions,
  studioVisibleModes,
  superResolutionActions,
} from "./mode-config";

describe("mode-specific studio configuration", () => {
  it("consolidates the studio into six distinct creation categories", () => {
    expect(studioVisibleModes).toEqual(["text", "image", "edit", "remove-bg", "upscale", "batch"]);
    expect(studioModeDefinitions["remove-bg"].label).toBe("图片编辑");
    expect(studioModeDefinitions.upscale.label).toBe("超分");
    expect(studioVisibleModes).not.toContain("background");
  });

  it("keeps image-to-image output controls, templates and prompt", () => {
    expect(studioModeDefinitions.image.controls).toEqual(expect.arrayContaining([
      "source", "model", "aspect", "count", "resolution", "prompt",
    ]));
    expect(studioModeDefinitions.image.templates.length).toBeGreaterThan(0);
  });

  it("defines image editing and super-resolution operations", () => {
    expect(imageEditActions.map((item) => item.value)).toEqual([
      "remove-background", "replace-background", "change-clothes", "swap-face", "add-text",
    ]);
    expect(superResolutionActions.map((item) => item.value)).toEqual([
      "2x", "4x", "variation", "restore-photo", "face-enhance",
    ]);
    expect(studioModeDefinitions["remove-bg"].controls).not.toContain("resolution");
    expect(studioModeDefinitions.upscale.controls).not.toContain("resolution");
  });
});
