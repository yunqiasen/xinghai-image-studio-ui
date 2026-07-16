import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("frontend nginx upload limit", () => {
  it("accepts the backend image task request limit", () => {
    const config = readFileSync(new URL("../../nginx.conf", import.meta.url), "utf8");
    expect(config).toMatch(/client_max_body_size\s+32m;/);
  });
});
