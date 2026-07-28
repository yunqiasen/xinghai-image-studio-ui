import { describe, expect, it } from "vitest";

import { createResultSourceAsset, parentEditContext } from "./result-edit-context";

describe("result edit context", () => {
  it("keeps the originating task and selected image index", () => {
    const source = createResultSourceAsset("/result-2.png", "web-parent", 1);
    expect(source.sourceTaskId).toBe("web-parent");
    expect(source.sourceImageIndex).toBe(1);
    expect(parentEditContext([source, { id: "mask", name: "mask.png", role: "mask", dataUrl: "mask", url: "" }])).toEqual({
      parentTaskId: "web-parent",
      parentImageIndex: 1,
    });
  });

  it("does not invent parent context for an uploaded source", () => {
    expect(parentEditContext([{ id: "upload", name: "source.png", role: "image", dataUrl: "data:image/png;base64,x", url: "" }])).toEqual({});
  });
});
