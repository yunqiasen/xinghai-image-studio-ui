import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchSiteInfo } from "./site-info";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchSiteInfo", () => {
  it("loads and normalizes the documented public site configuration", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 0,
      message: "ok",
      data: {
        "site.name": "星海创作",
        "site.description": "AI 图像工作台",
        "site.logo_url": "/brand.svg",
        "site.footer": "星海工作室",
        "site.contact_email": "support@example.com",
        "site.docs_url": "https://docs.example.com",
        "site.api_base_url": "https://api.example.com",
      },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchSiteInfo()).resolves.toEqual({
      name: "星海创作",
      description: "AI 图像工作台",
      logoUrl: "/brand.svg",
      footer: "星海工作室",
      contactEmail: "support@example.com",
      docsUrl: "https://docs.example.com",
      apiBaseUrl: "https://api.example.com",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/public/site-info", expect.objectContaining({
      method: "GET",
      credentials: "include",
    }));
  });

  it("uses the backend message when the public configuration request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 50301,
      message: "站点配置暂不可用",
      data: {},
    }), { status: 503, headers: { "Content-Type": "application/json" } })));

    await expect(fetchSiteInfo()).rejects.toThrow("站点配置暂不可用");
  });
});
