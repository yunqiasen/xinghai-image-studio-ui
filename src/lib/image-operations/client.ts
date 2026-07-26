import { commercialBlob } from "@/lib/commercial-api/request";

export function cutoutImage(image: File, options: { tolerance?: number; feather?: number } = {}) {
  const body = new FormData();
  body.append("image", image);
  body.append("tolerance", String(options.tolerance ?? 34));
  body.append("feather", String(options.feather ?? 22));
  return commercialBlob("/api/image/cutout", { method: "POST", body });
}

export function replaceImageBackground(foreground: File, background: File, options: { autoCutout?: boolean } = {}) {
  const body = new FormData();
  body.append("foreground", foreground);
  body.append("background", background);
  body.append("auto_cutout", String(options.autoCutout ?? false));
  return commercialBlob("/api/image/background-replace", { method: "POST", body });
}

export function localMaskEdit(image: File, mask: File, options: { radius?: number } = {}) {
  const body = new FormData();
  body.append("image", image);
  body.append("mask", mask);
  body.append("radius", String(options.radius ?? 5));
  return commercialBlob("/api/image/local-mask-edit", { method: "POST", body });
}
