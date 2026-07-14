import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearGallery,
  fetchGallery,
  fetchRegistrationPolicy,
  isEmailAllowedByPolicy,
  loadCurrentUser,
  loginLocalUser,
  logoutLocalUser,
  normalizeAllowedEmailDomains,
  redeemCredits,
  registerLocalUser,
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


describe("commercial user API coverage", () => {
  const user = {
    id: "usr_1",
    name: "星海用户",
    email: "user@example.com",
    credits: 20,
    role: "user",
    unlimitedCredits: false,
    createdAt: "2026-07-10T10:00:00+08:00",
  };

  it("loads the current cookie session", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, user }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(loadCurrentUser()).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", expect.objectContaining({ method: "GET", credentials: "include" }));
  });

  it("registers, logs in, and logs out through the documented auth routes", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, user }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, user }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await registerLocalUser({ name: user.name, email: user.email, password: "123456", redeemCode: "WELCOME" });
    await loginLocalUser({ email: user.email, password: "123456" });
    await logoutLocalUser();

    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual([
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/logout",
    ]);
    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toEqual({
      name: user.name, email: user.email, password: "123456", redeemCode: "WELCOME",
    });
  });

  it("redeems only a code and consumes gallery responses from the backend", async () => {
    const item = { id: "gallery-1", url: "/p/img/1", prompt: "星空", mode: "text", createdAt: user.createdAt };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, user: { ...user, credits: 120 }, amount: 100 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, items: [item] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, items: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(redeemCredits("XINGHAI-2026")).resolves.toMatchObject({ credits: 120 });
    await expect(fetchGallery()).resolves.toEqual([item]);
    await expect(clearGallery()).resolves.toEqual([]);

    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toEqual({ code: "XINGHAI-2026" });
    expect(fetchMock.mock.calls.map(([path, options]) => [path, (options as RequestInit).method])).toEqual([
      ["/api/credits/redeem", "POST"],
      ["/api/gallery", "GET"],
      ["/api/gallery", "DELETE"],
    ]);
  });
});
