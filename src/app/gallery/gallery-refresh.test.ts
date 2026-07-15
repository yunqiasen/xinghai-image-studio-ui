import { describe, expect, it } from "vitest";

import { shouldPollGallery, shouldResetGalleryForUser } from "./gallery-refresh";

describe("gallery refresh policy", () => {
  it("polls while the current user has an active generation", () => {
    expect(shouldPollGallery("usr_1", "running")).toBe(true);
    expect(shouldPollGallery("usr_1", "queued")).toBe(true);
    expect(shouldPollGallery("usr_1", "succeeded")).toBe(false);
    expect(shouldPollGallery(null, "running")).toBe(false);
  });

  it("clears stale cards whenever the account changes", () => {
    expect(shouldResetGalleryForUser("usr_1", "usr_2")).toBe(true);
    expect(shouldResetGalleryForUser("usr_1", null)).toBe(true);
    expect(shouldResetGalleryForUser("usr_1", "usr_1")).toBe(false);
  });
});
