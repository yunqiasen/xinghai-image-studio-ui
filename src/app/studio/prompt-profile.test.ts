import { describe, expect, it } from "vitest";
import { promptProfileForStudioMode } from "./prompt-profile";

describe("prompt workflow profile", () => {
  it("maps image and video workflows independently", () => {
    expect(promptProfileForStudioMode("text")).toBe("text_to_image");
    expect(promptProfileForStudioMode("image")).toBe("image_to_image");
    expect(promptProfileForStudioMode("edit")).toBe("image_to_image");
    expect(promptProfileForStudioMode("video-text")).toBe("text_to_video");
    expect(promptProfileForStudioMode("video-image")).toBe("image_to_video");
  });
});
