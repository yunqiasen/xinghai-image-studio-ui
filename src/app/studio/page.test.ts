import { describe, expect, it } from "vitest";

import {
  EDITOR_PANEL_GRID_CLASS_NAME,
  GENERATED_IMAGE_CLASS_NAME,
  PREVIEW_PANEL_CLASS_NAME,
  STUDIO_TEMPLATE_SIDEBAR_ENABLED,
  STUDIO_WORKSPACE_GRID_CLASS_NAME,
} from "./page";

describe("studio result layout", () => {
  it("uses left editor and right preview instead of the old three-column template layout", () => {
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("xl:grid-cols-[minmax(520px,0.82fr)_minmax(620px,1.18fr)]");
    expect(EDITOR_PANEL_GRID_CLASS_NAME).toContain("lg:grid-cols-[156px_minmax(0,1fr)]");
    expect(PREVIEW_PANEL_CLASS_NAME).toContain("xl:sticky");
    expect(STUDIO_TEMPLATE_SIDEBAR_ENABLED).toBe(false);
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).not.toContain("_300px");
  });

  it("shows generated images without forced square cropping", () => {
    expect(GENERATED_IMAGE_CLASS_NAME).toContain("object-contain");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("object-cover");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("aspect-square");
  });
});
