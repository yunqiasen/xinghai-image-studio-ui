import { describe, expect, it } from "vitest";

import type { StudioAsset } from "./mode-settings";
import {
  auxiliaryRoleForEditAction,
  mergeImageEditPastedAssets,
  normalizeImageEditAssets,
  pasteTargetMode,
} from "./image-edit-assets";

const asset = (id: string, role: StudioAsset["role"] = "image"): StudioAsset => ({
  id,
  role,
  name: `${id}.png`,
  dataUrl: `data:${id}`,
  url: "",
});

describe("image edit assets", () => {
  it("keeps prompt paste in the current image workflow except text-to-image", () => {
    expect(pasteTargetMode("text")).toBe("image");
    expect(pasteTargetMode("image")).toBe("image");
    expect(pasteTargetMode("remove-bg")).toBe("remove-bg");
    expect(pasteTargetMode("upscale")).toBe("upscale");
    expect(pasteTargetMode("batch")).toBe("batch");
  });

  it("maps each two-image edit action to its dedicated auxiliary role", () => {
    expect(auxiliaryRoleForEditAction("replace-background")).toBe("background");
    expect(auxiliaryRoleForEditAction("change-clothes")).toBe("garment");
    expect(auxiliaryRoleForEditAction("swap-face")).toBe("face");
    expect(auxiliaryRoleForEditAction("remove-background")).toBeUndefined();
    expect(auxiliaryRoleForEditAction("add-text")).toBeUndefined();
  });

  it("assigns two pasted images to main and action-specific reference slots", () => {
    expect(mergeImageEditPastedAssets([], [asset("main"), asset("ref")], "change-clothes").map((item) => [item.id, item.role])).toEqual([
      ["main", "image"],
      ["ref", "garment"],
    ]);
  });

  it("fills the missing reference slot without replacing the main image", () => {
    expect(mergeImageEditPastedAssets([asset("main")], [asset("face")], "swap-face").map((item) => [item.id, item.role])).toEqual([
      ["main", "image"],
      ["face", "face"],
    ]);
  });

  it("keeps one main image, one matching reference, and internal masks only", () => {
    const normalized = normalizeImageEditAssets([
      asset("main-1"), asset("main-2"), asset("background", "background"), asset("garment", "garment"), asset("mask", "mask"),
    ], "replace-background");

    expect(normalized.map((item) => [item.id, item.role])).toEqual([
      ["main-1", "image"],
      ["background", "background"],
      ["mask", "mask"],
    ]);
  });
});
