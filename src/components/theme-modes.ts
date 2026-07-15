export type ThemeMode = "light" | "dark" | "colorful";

export const themeOptions = [
  { value: "light", label: "浅色" },
  { value: "dark", label: "暗色" },
  { value: "colorful", label: "彩色" },
] as const satisfies ReadonlyArray<{ value: ThemeMode; label: string }>;

export const THEME_STORAGE_KEY = "chatgpt-image-studio:theme";

export function normalizeThemeMode(value: string | null | undefined): ThemeMode {
  if (value === "light" || value === "dark" || value === "colorful") return value;
  if (value === "graphite") return "colorful";
  return "colorful";
}

export function nextThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === "light") return "dark";
  if (mode === "dark") return "colorful";
  return "light";
}
