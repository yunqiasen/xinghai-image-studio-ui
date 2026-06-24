import { describe, expect, it } from "vitest";

import {
  ASPECT_RATIO_SELECTOR_CLASS_NAME,
  COUNT_SELECTOR_CLASS_NAME,
  EDITOR_PANEL_GRID_CLASS_NAME,
  GENERATED_IMAGE_CLASS_NAME,
  MODE_DESCRIPTION_VISIBLE,
  PREVIEW_PANEL_CLASS_NAME,
  PRIMARY_ASPECT_RATIOS,
  STYLE_TAGS_ENABLED,
  STUDIO_HEADER_ENABLED,
  STUDIO_TEMPLATE_SIDEBAR_ENABLED,
  STUDIO_WORKSPACE_GRID_CLASS_NAME,
} from "./layout-constants";

describe("studio result layout", () => {
  it("uses a focused editor and large preview instead of the old three-column template layout", () => {
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("xl:grid-cols-[minmax(620px,0.88fr)_minmax(620px,1.12fr)]");
    expect(EDITOR_PANEL_GRID_CLASS_NAME).toContain("bg-[#12101d]/94");
    expect(PREVIEW_PANEL_CLASS_NAME).toContain("xl:sticky");
    expect(PREVIEW_PANEL_CLASS_NAME).toContain("bg-[#0f0d19]/95");
    expect(STUDIO_TEMPLATE_SIDEBAR_ENABLED).toBe(false);
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).not.toContain("_300px");
    expect(STUDIO_HEADER_ENABLED).toBe(false);
    expect(STYLE_TAGS_ENABLED).toBe(false);
    expect(MODE_DESCRIPTION_VISIBLE).toBe(true);
  });

  it("uses compact button controls for ratio and output count in the requested order", () => {
    expect(PRIMARY_ASPECT_RATIOS).toEqual(["1:1", "16:9", "3:2", "2:3", "3:4", "4:3", "9:16"]);
    expect(ASPECT_RATIO_SELECTOR_CLASS_NAME).toContain("grid-cols-4");
    expect(ASPECT_RATIO_SELECTOR_CLASS_NAME).toContain("sm:grid-cols-7");
    expect(COUNT_SELECTOR_CLASS_NAME).toContain("grid-cols-4");
  });

  it("shows generated images without forced square cropping", () => {
    expect(GENERATED_IMAGE_CLASS_NAME).toContain("object-contain");
    expect(GENERATED_IMAGE_CLASS_NAME).toContain("max-h-[calc(100vh-250px)]");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("object-cover");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("aspect-square");
  });
});
