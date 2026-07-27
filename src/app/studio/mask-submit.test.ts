import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const studioPage = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const imageSubmitHook = readFileSync(new URL("../image/hooks/use-image-submit.ts", import.meta.url), "utf8");

describe("AI local edit mask wiring", () => {
  it("submits the white-on-black selection mask from the commercial studio", () => {
    expect(studioPage).toContain("blobToDataUrl(payload.mask.selectionFile)");
    expect(studioPage).not.toContain("blobToDataUrl(payload.mask.file)");
  });

  it("submits the selection mask instead of the painted preview from the image workspace", () => {
    expect(imageSubmitHook).toContain("fileToDataUrl(mask.selectionFile)");
    expect(imageSubmitHook).not.toContain("dataUrl: mask.previewDataUrl");
  });
});
