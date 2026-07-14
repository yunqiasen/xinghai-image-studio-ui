import { describe, expect, it } from "vitest";

import {
  ASPECT_RATIO_SELECTOR_CLASS_NAME,
  CONTROLS_PANEL_CLASS_NAME,
  EDITOR_PANEL_GRID_CLASS_NAME,
  MODE_DESCRIPTION_VISIBLE,
  MODE_OPTION_CLASS_NAME,
  MODEL_SELECTOR_CLASS_NAME,
  PREVIEW_PANEL_CLASS_NAME,
  PRIMARY_ASPECT_RATIOS,
  PROMPT_TEMPLATE_COLLAPSED_COUNT,
  STUDIO_ACTION_BAR_CLASS_NAME,
  STUDIO_EDITOR_BODY_CLASS_NAME,
  STUDIO_HEADER_ENABLED,
  STUDIO_MODEL_LABEL,
  STUDIO_MODE_RAIL_CLASS_NAME,
  STUDIO_PAGE_CLASS_NAME,
  STUDIO_PARAMETER_SCROLL_CLASS_NAME,
  STUDIO_TEMPLATE_SIDEBAR_ENABLED,
  STUDIO_WORKSPACE_GRID_CLASS_NAME,
  STYLE_TAGS_ENABLED,
} from "./layout-constants";

describe("studio commercial workspace", () => {
  it("centers a 1240px workspace with a narrow 480px editor", () => {
    expect(STUDIO_PAGE_CLASS_NAME).toContain("lg:items-center");
    expect(STUDIO_PAGE_CLASS_NAME).toContain("lg:overflow-hidden");
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("max-w-[1240px]");
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("lg:grid-cols-[480px_minmax(0,1fr)]");
    expect(STUDIO_WORKSPACE_GRID_CLASS_NAME).toContain("lg:h-[min(820px,calc(100dvh-96px))]");
    expect(EDITOR_PANEL_GRID_CLASS_NAME).toContain("lg:h-full");
    expect(CONTROLS_PANEL_CLASS_NAME).toContain("lg:grid-rows-[74px_minmax(0,1fr)_66px]");
    expect(PREVIEW_PANEL_CLASS_NAME).toContain("grid-rows-[74px_minmax(0,1fr)_42px]");
  });

  it("keeps the mode rail visible while parameters scroll and the action bar stays fixed", () => {
    expect(STUDIO_EDITOR_BODY_CLASS_NAME).toContain("lg:grid-cols-[176px_minmax(0,1fr)]");
    expect(STUDIO_MODE_RAIL_CLASS_NAME).toContain("overflow-y-auto");
    expect(STUDIO_PARAMETER_SCROLL_CLASS_NAME).toContain("overflow-y-auto");
    expect(STUDIO_ACTION_BAR_CLASS_NAME).toContain("border-t");
    expect(MODE_OPTION_CLASS_NAME).toContain("min-h-[54px]");
    expect(MODE_DESCRIPTION_VISIBLE).toBe(true);
  });

  it("keeps every existing generation control", () => {
    expect(STUDIO_MODEL_LABEL).toBe("GPT Image 2.0");
    expect(MODEL_SELECTOR_CLASS_NAME).toContain("rounded-2xl");
    expect(PROMPT_TEMPLATE_COLLAPSED_COUNT).toBe(4);
    expect(PRIMARY_ASPECT_RATIOS).toEqual(["1:1", "16:9", "3:2", "2:3", "3:4", "4:3", "9:16"]);
    expect(ASPECT_RATIO_SELECTOR_CLASS_NAME).toContain("grid-cols-7");
    expect(STUDIO_TEMPLATE_SIDEBAR_ENABLED).toBe(false);
    expect(STUDIO_HEADER_ENABLED).toBe(false);
    expect(STYLE_TAGS_ENABLED).toBe(false);
  });
});
