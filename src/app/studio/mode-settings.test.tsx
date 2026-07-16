import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";

import { ModeSettings, type StudioSettingsValue } from "./mode-settings";

const value: StudioSettingsValue = {
  model: "gpt-image-2",
  aspectRatio: "1:1",
  count: 1,
  resolution: "1k",
  prompt: "测试提示词",
  imageEditAction: "remove-background",
  superAction: "2x",
  referenceStrength: 70,
  preserveComposition: true,
  consistency: 80,
  variation: 30,
  overlayText: "",
};

function renderMode(mode: Parameters<typeof ModeSettings>[0]["mode"]) {
  return renderToStaticMarkup(
    <LanguageProvider initialLocale="zh-CN">
      <ModeSettings
        mode={mode}
        value={value}
        assets={[]}
        onChange={() => undefined}
        onFiles={() => undefined}
        onRemoveAsset={() => undefined}
        onOpenMaskEditor={() => undefined}
      />
    </LanguageProvider>,
  );
}

describe("ModeSettings", () => {
  it("keeps image-to-image source, output and prompt controls", () => {
    const html = renderMode("image");
    expect(html).toContain("上传参考图");
    expect(html).toContain("参考强度");
    expect(html).toContain("比例");
    expect(html).toContain("分辨率");
    expect(html).not.toContain("提示词");
    expect(html).not.toContain("提示词模板");
  });

  it("puts the model selector at the top of every category", () => {
    const html = renderMode("image");
    expect(html.indexOf("模型")).toBeLessThan(html.indexOf("上传参考图"));
    expect(html).toContain("GPT Image 2.0");
  });

  it("renders image editing operations without resolution settings", () => {
    const html = renderMode("remove-bg");
    for (const label of ["去背景", "换背景", "换衣服", "换脸", "加文字"]) {
      expect(html).toContain(label);
    }
    expect(html).not.toContain("分辨率");
  });

  it("renders super-resolution operations without the generic resolution panel", () => {
    const html = renderMode("upscale");
    for (const label of ["2× 超分", "4× 超分", "图片变体", "老照片修复", "人脸增强"]) {
      expect(html).toContain(label);
    }
    expect(html).not.toContain("输出清晰度");
  });
});
