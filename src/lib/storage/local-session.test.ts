import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchRegistrationPolicy,
  isEmailAllowedByPolicy,
  normalizeAllowedEmailDomains,
  type RegistrationPolicy,
} from "./local-session";

const policy: RegistrationPolicy = {
  enabled: true,
  allowedEmailDomains: ["qq.com", "gmail.com"],
  ipLimitEnabled: true,
  ipAccountLimit: 1,
  phoneRequired: false,
  smsRequired: false,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("registration policy", () => {
  it("normalizes and deduplicates allowed email domains", () => {
    expect(normalizeAllowedEmailDomains([" @QQ.com ", "qq.com", "Gmail.com", ""])).toEqual([
      "qq.com",
      "gmail.com",
    ]);
  });

  it("validates email domains from the backend policy", () => {
    expect(isEmailAllowedByPolicy("user@qq.com", policy)).toBe(true);
    expect(isEmailAllowedByPolicy("USER@GMAIL.COM", policy)).toBe(true);
    expect(isEmailAllowedByPolicy("user@example.com", policy)).toBe(false);
    expect(isEmailAllowedByPolicy("invalid-email", policy)).toBe(false);
    expect(isEmailAllowedByPolicy("user@example.com", { ...policy, allowedEmailDomains: [] })).toBe(true);
  });

  it("loads registration policy through the documented cookie-session endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          policy: { ...policy, allowedEmailDomains: ["@QQ.com", "gmail.com"] },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchRegistrationPolicy()).resolves.toEqual(policy);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/registration-policy",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("uses the documented message field for policy request errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: false, error: "fallback", message: "注册规则暂不可用" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(fetchRegistrationPolicy()).rejects.toThrow("注册规则暂不可用");
  });
});
