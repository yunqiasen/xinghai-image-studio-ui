import { describe, expect, it } from "vitest";

import { clipboardImageFiles } from "./prompt-paste";

describe("clipboardImageFiles", () => {
  it("returns every pasted image file and ignores pasted text", () => {
    const first = { name: "first.png", type: "image/png" } as File;
    const second = { name: "second.webp", type: "image/webp" } as File;
    const items = [
      { kind: "string", type: "text/plain", getAsFile: () => null },
      { kind: "file", type: "image/png", getAsFile: () => first },
      { kind: "file", type: "image/webp", getAsFile: () => second },
      { kind: "file", type: "application/pdf", getAsFile: () => ({ name: "x.pdf" }) },
    ] as unknown as DataTransferItemList;

    expect(clipboardImageFiles({ items })).toEqual([first, second]);
  });
});

import { mergePastedImageAssets } from "./prompt-paste";
import type { StudioAsset } from "./mode-settings";

it("keeps existing reference images, removes masks, and limits the reference list to four", () => {
  const asset = (id: string, role: StudioAsset["role"] = "image"): StudioAsset => ({ id, role, name: id, dataUrl: id, url: "" });
  const previous = [asset("old-1"), asset("mask", "mask"), asset("old-2")];
  const pasted = [asset("new-1"), asset("new-2"), asset("new-3")];

  expect(mergePastedImageAssets(previous, pasted).map((item) => item.id)).toEqual(["old-1", "old-2", "new-1", "new-2"]);
});
