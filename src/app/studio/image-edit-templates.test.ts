import { describe, expect, it } from "vitest";

import { imageEditTemplatesForAction } from "./image-edit-templates";

describe("image edit media templates", () => {
  it("returns background templates with the background source role", () => {
    const templates = imageEditTemplatesForAction("replace-background");
    expect(templates.length).toBeGreaterThanOrEqual(3);
    expect(templates.every((item) => item.role === "background")).toBe(true);
  });

  it("returns garment and face templates with dedicated source roles", () => {
    expect(imageEditTemplatesForAction("change-clothes").every((item) => item.role === "garment")).toBe(true);
    expect(imageEditTemplatesForAction("swap-face").every((item) => item.role === "face")).toBe(true);
  });

  it("does not expose internal instruction templates for cutout or text overlay", () => {
    expect(imageEditTemplatesForAction("remove-background")).toEqual([]);
    expect(imageEditTemplatesForAction("add-text")).toEqual([]);
  });
});
