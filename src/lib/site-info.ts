export type SiteInfo = {
  name: string;
  description: string;
  logoUrl: string;
  footer: string;
  contactEmail: string;
  docsUrl: string;
  apiBaseUrl: string;
};

type SiteInfoPayload = {
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
};

export const DEFAULT_SITE_INFO: SiteInfo = {
  name: "星海图像",
  description: "AI 图像创作平台",
  logoUrl: "",
  footer: "",
  contactEmail: "",
  docsUrl: "",
  apiBaseUrl: "",
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function fetchSiteInfo(): Promise<SiteInfo> {
  const response = await fetch("/api/public/site-info", {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const payload = await response.json().catch(() => ({})) as SiteInfoPayload;
  if (!response.ok || (typeof payload.code === "number" && payload.code !== 0)) {
    throw new Error(text(payload.message) || `站点配置请求失败 HTTP ${response.status}`);
  }
  const data = payload.data || {};
  return {
    name: text(data["site.name"]) || DEFAULT_SITE_INFO.name,
    description: text(data["site.description"]) || DEFAULT_SITE_INFO.description,
    logoUrl: text(data["site.logo_url"]),
    footer: text(data["site.footer"]),
    contactEmail: text(data["site.contact_email"]),
    docsUrl: text(data["site.docs_url"]),
    apiBaseUrl: text(data["site.api_base_url"]),
  };
}
