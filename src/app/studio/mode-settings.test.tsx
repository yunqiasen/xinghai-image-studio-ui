import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";

import { ModeSettings, type StudioSettingsValue } from "./mode-settings";

const value: StudioSettingsValue = {
  model: "gpt-image-2",
  aspectRatio: "1:1",
  count: 1,
  resolution: "1k",
  quality: "standard",
  prompt: "测试提示词",
  imageEditAction: "remove-background",
  superAction: "2x",
  referenceStrength: 70,
  preserveComposition: true,
  consistency: 80,
  variation: 30,
  fontFamily: "sans",
  overlayText: "",
  fontSize: 64,
  textColor: "#FFFFFF",
  textPosition: "bottom-center",
  textX: 0,
  textY: 0,
  cutoutTolerance: 34,
  cutoutFeather: 22,
  autoCutout: true,
  style: "",
  backgroundDescription: "",
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

  it("shows a prominent local-edit action inside image-to-image after a source is added", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN">
        <ModeSettings
          mode="image"
          value={value}
          assets={[{ id: "source-1", name: "source.png", dataUrl: "data:image/png;base64,AA==", url: "", role: "image" }]}
          onChange={() => undefined}
          onFiles={() => undefined}
          onRemoveAsset={() => undefined}
          onOpenMaskEditor={() => undefined}
        />
      </LanguageProvider>,
    );

    expect(html).toContain('data-studio-action="local-edit"');
    expect(html).toContain("局部编辑");
  });

  it("only offers backend-supported image counts", () => {
    const html = renderMode("text");
    expect(html).toContain('value="1"');
    expect(html).toContain('value="2"');
    expect(html).toContain('value="4"');
    expect(html).not.toContain('value="3"');
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

describe("local image operation inputs", () => {
  it("asks for a separate background source when replacement is selected", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN">
        <ModeSettings
          mode="remove-bg"
          value={{ ...value, imageEditAction: "replace-background" }}
          assets={[]}
          onChange={() => undefined}
          onFiles={() => undefined}
          onRemoveAsset={() => undefined}
          onOpenMaskEditor={() => undefined}
        />
      </LanguageProvider>,
    );
    expect(html).toContain("上传背景图");
  });
});


describe("operation-specific API controls", () => {
  it("uploads garments and faces with their documented source roles", () => {
    const clothes = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN">
        <ModeSettings mode="remove-bg" value={{ ...value, imageEditAction: "change-clothes" }} assets={[]} onChange={() => undefined} onFiles={() => undefined} onRemoveAsset={() => undefined} onOpenMaskEditor={() => undefined} />
      </LanguageProvider>,
    );
    const face = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN">
        <ModeSettings mode="remove-bg" value={{ ...value, imageEditAction: "swap-face" }} assets={[]} onChange={() => undefined} onFiles={() => undefined} onRemoveAsset={() => undefined} onOpenMaskEditor={() => undefined} />
      </LanguageProvider>,
    );
    expect(clothes).toContain('data-upload-role="garment"');
    expect(face).toContain('data-upload-role="face"');
  });

  it("renders deterministic text overlay and dynamic quality controls", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN">
        <ModeSettings
          mode="remove-bg"
          value={{ ...value, imageEditAction: "add-text", overlayText: "星海新品" }}
          assets={[]}
          models={[{ value: "agnes", label: "Agnes Image" }]}
          availableQualities={["standard", "high"]}
          onChange={() => undefined}
          onFiles={() => undefined}
          onRemoveAsset={() => undefined}
          onOpenMaskEditor={() => undefined}
        />
      </LanguageProvider>,
    );
    expect(html).toContain("字体大小");
    expect(html).toContain("文字颜色");
    expect(html).toContain("快捷位置");
    expect(html).toContain('data-text-position-picker="nine-grid"');
    expect(html).not.toContain('aria-label="X"');
    expect(html).not.toContain('aria-label="Y"');
    expect(html).toContain("输出质量");
    expect(html).toContain("Agnes Image");
  });

  it("marks backend-paused operations as unavailable", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN">
        <ModeSettings
          mode="upscale"
          value={{ ...value, superAction: "variation" }}
          assets={[]}
          availableOperations={["variation", "face_enhance"]}
          onChange={() => undefined}
          onFiles={() => undefined}
          onRemoveAsset={() => undefined}
          onOpenMaskEditor={() => undefined}
        />
      </LanguageProvider>,
    );
    expect(html).toContain('data-operation-available="false"');
    expect(html).toContain("暂未开放");
  });
});
