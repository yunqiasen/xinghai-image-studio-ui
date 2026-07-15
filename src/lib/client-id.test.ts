import { describe, expect, it } from "vitest";

import { createClientId, createLocalId } from "./client-id";

describe("client id generation", () => {
  it("uses randomUUID when the browser provides it", () => {
    const source = {
      randomUUID: () => "12345678-1234-1234-1234-123456789abc",
    } as Crypto;

    expect(createClientId("web", source)).toBe("web_12345678123412341234123456789abc");
    expect(createLocalId(source)).toBe("12345678-1234-1234-1234-123456789abc");
  });

  it("falls back when randomUUID is unavailable in an insecure browser context", () => {
    const source = {
      getRandomValues: (values: Uint8Array) => {
        values.set(Array.from({ length: values.length }, (_, index) => index));
        return values;
      },
    } as Crypto;

    expect(createClientId("turn", source)).toBe("turn_000102030405460788090a0b0c0d0e0f");
    expect(createLocalId(source)).toMatch(/^00010203-0405-4607-8809-0a0b0c0d0e0f$/);
  });
});
