import { describe, expect, it } from "vitest";

import {
  ASPECT_RATIO_SELECTOR_CLASS_NAME,
  CONTROLS_PANEL_CLASS_NAME,
  EDITOR_PANEL_GRID_CLASS_NAME,
  GENERATED_IMAGE_CLASS_NAME,
  MODE_DESCRIPTION_VISIBLE,
  MODEL_SELECTOR_CLASS_NAME,
  PREVIEW_PANEL_CLASS_NAME,
  PRIMARY_ASPECT_RATIOS,
  PROMPT_TEMPLATE_COLLAPSED_COUNT,
  STUDIO_HEADER_ENABLED,
  STUDIO_MODEL_LABEL,
  STUDIO_PAGE_CLASS_NAME,
  STUDIO_TEMPLATE_SIDEBAR_ENABLED,
  STUDIO_WORKSPACE_GRID_CLASS_NAME,
  STYLE_TAGS_ENABLED,
} from "./layout-constants";

describe("studio result layout", () => {
  it("keeps the commercial page light while using a local dark control panel", () => {
    expect(STUDIO_PAGE_CLASS_NAME).toContain("bg-[#f6f8fc]");
    expect(STUDIO_PAGE_CLASS_NAME).not.toContain("rounded-[34px]");
    expect(STUDIO_PAGE_CLASS_NAME).toContain("overflow-x-hidden");
    expect(STUDIO_PAGE_CLASS_NAME).not.toContain("lg:overflow-y-auto");
    expect(STUDIO_PAGE_CLASS_NAME).not.toContain("bg-[#080812]");
    expect(EDITOR_PANEL_GRID_CLASS_NAME).toBe("min-w-0");
    expect(CONTROLS_PANEL_CLASS_NAME).toContain("#171626");
    expect(PREVIEW_PANEL_CLASS_NAME).toContain("bg-white/96");
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("max-w-[1880px]");
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("lg:grid-cols-[minmax(560px,0.84fr)_minmax(420px,1.16fr)]");
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("xl:grid-cols-[minmax(660px,0.88fr)_minmax(560px,1.12fr)]");
    expect(STUDIO_TEMPLATE_SIDEBAR_ENABLED).toBe(false);
    expect(STUDIO_HEADER_ENABLED).toBe(false);
    expect(STYLE_TAGS_ENABLED).toBe(false);
    expect(MODE_DESCRIPTION_VISIBLE).toBe(true);
  });

  it("uses model selector, compact ratio controls, and collapsed prompt templates", () => {
    expect(STUDIO_MODEL_LABEL).toBe("GPT Image 2.0");
    expect(MODEL_SELECTOR_CLASS_NAME).toContain("rounded-2xl");
    expect(PROMPT_TEMPLATE_COLLAPSED_COUNT).toBe(4);
    expect(PRIMARY_ASPECT_RATIOS).toEqual(["1:1", "16:9", "3:2", "2:3", "3:4", "4:3", "9:16"]);
    expect(ASPECT_RATIO_SELECTOR_CLASS_NAME).toContain("sm:grid-cols-7");
    expect(ASPECT_RATIO_SELECTOR_CLASS_NAME).not.toContain("xl:grid-cols-4");
  });

  it("shows generated images without forced square cropping", () => {
    expect(GENERATED_IMAGE_CLASS_NAME).toContain("object-contain");
    expect(GENERATED_IMAGE_CLASS_NAME).toContain("max-h-[calc(100vh-270px)]");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("object-cover");
    expect(GENERATED_IMAGE_CLASS_NAME).not.toContain("aspect-square");
  });
});
