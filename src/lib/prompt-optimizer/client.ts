import { commercialJson } from "@/lib/commercial-api/request";

import type { PromptOptimizeInput, PromptOptimizeResult } from "./types";

export function optimizePrompt(input: PromptOptimizeInput) {
  return commercialJson<PromptOptimizeResult>("/api/prompt/optimize", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
