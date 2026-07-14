import type { StudioAspectRatio } from "@/lib/image2api/size-presets";

export function aspectRatioCss(value: StudioAspectRatio | string) {
  const [width, height] = value.split(":").map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return "1 / 1";
  return `${width} / ${height}`;
}

export function resultGridClass(count: number) {
  if (count <= 1) return "grid grid-cols-1 gap-3";
  return "grid grid-cols-1 gap-3 sm:grid-cols-2";
}

export function formatGenerationElapsed(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
