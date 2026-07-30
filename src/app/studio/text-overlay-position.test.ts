import { describe, expect, it } from "vitest";

import { displayPositionToImageCoordinates, textOverlayAnchor } from "./text-overlay-position";

describe("text overlay positioning", () => {
  it("maps displayed coordinates to original image pixels", () => {
    expect(displayPositionToImageCoordinates({
      left: 250,
      top: 125,
      displayWidth: 500,
      displayHeight: 250,
      naturalWidth: 1000,
      naturalHeight: 500,
      overlayWidth: 100,
      overlayHeight: 40,
    })).toEqual({ x: 500, y: 250 });
  });

  it("clamps dragged text inside the original image", () => {
    expect(displayPositionToImageCoordinates({
      left: 490,
      top: 245,
      displayWidth: 500,
      displayHeight: 250,
      naturalWidth: 1000,
      naturalHeight: 500,
      overlayWidth: 100,
      overlayHeight: 40,
    })).toEqual({ x: 800, y: 420 });
  });

  it("returns predictable anchors for the nine quick positions", () => {
    expect(textOverlayAnchor("top-left")).toEqual({ left: "7%", top: "8%", transform: "translate(0, 0)" });
    expect(textOverlayAnchor("center")).toEqual({ left: "50%", top: "50%", transform: "translate(-50%, -50%)" });
    expect(textOverlayAnchor("bottom-right")).toEqual({ left: "93%", top: "92%", transform: "translate(-100%, -100%)" });
  });
});
