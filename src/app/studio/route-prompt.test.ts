import { describe, expect, it } from "vitest";

import { MAX_STUDIO_PROMPT_LENGTH, readStudioRoutePrompt } from "./route-prompt";

describe("studio route prompt", () => {
  it("accepts a non-empty prompt from router state", () => {
    expect(readStudioRoutePrompt({ prompt: "  星港远航，电影级构图  " })).toBe("星港远航，电影级构图");
  });

  it("ignores malformed route state", () => {
    expect(readStudioRoutePrompt(null)).toBeNull();
    expect(readStudioRoutePrompt({})).toBeNull();
    expect(readStudioRoutePrompt({ prompt: "   " })).toBeNull();
    expect(readStudioRoutePrompt({ prompt: 42 })).toBeNull();
  });

  it("caps imported templates at the supported editor length", () => {
    expect(MAX_STUDIO_PROMPT_LENGTH).toBe(4000);
    expect(readStudioRoutePrompt({ prompt: "a".repeat(4100) })).toHaveLength(4000);
  });
});
