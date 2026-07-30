import { commercialJson } from "@/lib/commercial-api/request";

import type { ImageModel } from "./types";

export async function listImageModels() {
  const payload = await commercialJson<{ ok: true; items: ImageModel[] }>("/api/models?type=image", { method: "GET" });
  return payload.items.filter((model) => model.runtimeReady);
}
