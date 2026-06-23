export type LocalUser = {
  id: string;
  name: string;
  email: string;
  credits: number;
  createdAt: string;
};

export type GalleryItem = {
  id: string;
  url: string;
  prompt: string;
  mode: string;
  createdAt: string;
};

const authEvent = "xinghai-auth-change";
let currentUser: LocalUser | null = null;

function emitAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(authEvent));
}

export function onAuthChange(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(authEvent, listener);
  return () => window.removeEventListener(authEvent, listener);
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `请求失败 HTTP ${response.status}`);
  return payload as T;
}

export function setCurrentUser(user: LocalUser | null) {
  currentUser = user;
  emitAuthChange();
}

export function getCurrentUser(): LocalUser | null {
  return currentUser;
}

export function getLocalUser(): LocalUser {
  return currentUser || {
    id: "guest",
    name: "未登录用户",
    email: "",
    credits: 0,
    createdAt: new Date().toISOString(),
  };
}

export async function loadCurrentUser() {
  const payload = await apiRequest<{ ok: boolean; user: LocalUser | null }>("/api/auth/me", { method: "GET" });
  currentUser = payload.user;
  emitAuthChange();
  return currentUser;
}

export async function registerLocalUser(input: { name: string; email: string; password: string; redeemCode?: string }) {
  const payload = await apiRequest<{ ok: boolean; user: LocalUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  currentUser = payload.user;
  emitAuthChange();
  return payload.user;
}

export async function loginLocalUser(input: { email: string; password: string }) {
  const payload = await apiRequest<{ ok: boolean; user: LocalUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  currentUser = payload.user;
  emitAuthChange();
  return payload.user;
}

export async function logoutLocalUser() {
  await apiRequest<{ ok: boolean }>("/api/auth/logout", { method: "POST", body: JSON.stringify({}) });
  currentUser = null;
  emitAuthChange();
}

export async function redeemCredits(code: string) {
  const payload = await apiRequest<{ ok: boolean; user: LocalUser; amount: number }>("/api/credits/redeem", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  currentUser = payload.user;
  emitAuthChange();
  return payload.user;
}

export async function addCredits(amount: number) {
  const payload = await apiRequest<{ ok: boolean; user: LocalUser; amount: number }>("/api/credits/redeem", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
  currentUser = payload.user;
  emitAuthChange();
  return payload.user;
}

export async function fetchGallery() {
  const payload = await apiRequest<{ ok: boolean; items: GalleryItem[] }>("/api/gallery", { method: "GET" });
  return payload.items;
}

export async function clearGallery() {
  const payload = await apiRequest<{ ok: boolean; items: GalleryItem[] }>("/api/gallery", { method: "DELETE" });
  return payload.items;
}
