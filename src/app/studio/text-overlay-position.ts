import type { CSSProperties } from "react";

import type { TextOverlayPosition } from "@/lib/image-models/types";

type DisplayPositionInput = {
  left: number;
  top: number;
  displayWidth: number;
  displayHeight: number;
  naturalWidth: number;
  naturalHeight: number;
  overlayWidth: number;
  overlayHeight: number;
};

export function displayPositionToImageCoordinates(input: DisplayPositionInput) {
  const maxLeft = Math.max(0, input.displayWidth - input.overlayWidth);
  const maxTop = Math.max(0, input.displayHeight - input.overlayHeight);
  const left = Math.min(maxLeft, Math.max(0, input.left));
  const top = Math.min(maxTop, Math.max(0, input.top));
  return {
    x: Math.round((left / Math.max(1, input.displayWidth)) * input.naturalWidth),
    y: Math.round((top / Math.max(1, input.displayHeight)) * input.naturalHeight),
  };
}

export function textOverlayAnchor(position: TextOverlayPosition): Pick<CSSProperties, "left" | "top" | "transform"> {
  const horizontal = position.includes("left") ? { left: "7%", translateX: "0" }
    : position.includes("right") ? { left: "93%", translateX: "-100%" }
      : { left: "50%", translateX: "-50%" };
  const vertical = position.includes("top") ? { top: "8%", translateY: "0" }
    : position.includes("bottom") ? { top: "92%", translateY: "-100%" }
      : { top: "50%", translateY: "-50%" };
  return {
    left: horizontal.left,
    top: vertical.top,
    transform: `translate(${horizontal.translateX}, ${vertical.translateY})`,
  };
}
