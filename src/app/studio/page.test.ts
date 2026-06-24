import { describe, expect, it } from "vitest";

import {
  ASPECT_RATIO_SELECTOR_CLASS_NAME,
  COUNT_SELECTOR_CLASS_NAME,
  EDITOR_PANEL_GRID_CLASS_NAME,
  GENERATED_IMAGE_CLASS_NAME,
  MODE_DESCRIPTION_VISIBLE,
  PREVIEW_PANEL_CLASS_NAME,
  STYLE_TAGS_ENABLED,
  STUDIO_HEADER_ENABLED,
  STUDIO_TEMPLATE_SIDEBAR_ENABLED,
  STUDIO_WORKSPACE_GRID_CLASS_NAME,
} from "./layout-constants";

describe("studio result layout", () => {
  it("uses left editor and right preview instead of the old three-column template layout", () => {
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("xl:grid-cols-[minmax(660px,0.9fr)_minmax(620px,1.1fr)]");
    expect(EDITOR_PANEL_GRID_CLASS_NAME).toContain("lg:grid-cols-[220px_minmax(0,1fr)]");
    expect(PREVIEW_PANEL_CLASS_NAME).toContain("xl:sticky");
    expect(STUDIO_TEMPLATE_SIDEBAR_ENABLED).toBe(false);
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).not.toContain("_300px");
    expect(STUDIO_HEADER_ENABLED).toBe(false);
    expect(STYLE_TAGS_ENABLED).toBe(false);
    expect(MODE_DESCRIPTION_VISIBLE).toBe(false);
  });

  it("uses compact button controls for ratio and output count", () => {
    expect(ASPECT_RATIO_SELECTOR_CLASS_NAME).toContain("grid-cols-4");
    expect(ASPECT_RATIO_SELECTOR_CLASS_NAME).toContain("sm:grid-cols-7");
    expect(COUNT_SELECTOR_CLASS_NAME).toContain("grid-cols-4");
  });

  it("shows generated images without forced square cropping", () => {
    expect(GENERATED_IMAGE_CLASS_NAME).toContain("object-contain");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("object-cover");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("aspect-square");
  });
});
