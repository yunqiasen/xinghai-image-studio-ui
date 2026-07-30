import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";

import { ImageAssetSlots } from "./image-asset-slots";
import type { StudioAsset } from "./mode-settings";

function renderSlots(assets: StudioAsset[] = []) {
  return renderToStaticMarkup(
    <LanguageProvider initialLocale="zh-CN">
      <ImageAssetSlots
        action="change-clothes"
        assets={assets}
        onFiles={() => undefined}
        onRemoveAsset={() => undefined}
        onPreviewAsset={() => undefined}
      />
    </LanguageProvider>,
  );
}

describe("ImageAssetSlots", () => {
  it("renders fixed horizontal main and reference slots for clothes replacement", () => {
    const html = renderSlots();
    expect(html).toContain('data-image-edit-slots="two"');
    expect(html).toContain('data-asset-slot="image"');
    expect(html).toContain('data-asset-slot="garment"');
    expect(html).toContain("上传主图");
    expect(html).toContain("上传参考图");
    expect(html).toContain("grid-cols-2");
  });

  it("turns an uploaded source into a clickable preview card", () => {
    const html = renderSlots([{ id: "main", name: "main.png", role: "image", dataUrl: "data:image/png;base64,AA==", url: "" }]);
    expect(html).toContain('data-asset-preview="image"');
    expect(html).toContain('src="data:image/png;base64,AA=="');
    expect(html).toContain("更换主图");
  });
});
