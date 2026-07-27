import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { LanguageMode } from "@/components/language-modes";

import { StudioImageLightbox, StudioPreview } from "./studio-preview";

function renderPreview(element: ReactNode, locale: LanguageMode = "zh-CN") {
  return renderToStaticMarkup(
    <LanguageProvider initialLocale={locale}><ThemeProvider>{element}</ThemeProvider></LanguageProvider>,
  );
}

const baseProps = {
  aspectRatio: "1:1" as const,
  resolution: "1k" as const,
  count: 1,
  busy: false,
  results: [] as string[],
};

describe("StudioPreview", () => {
  it("renders one loading tile per requested image immediately after submission", () => {
    const html = renderPreview(<StudioPreview {...baseProps} busy count={3} startedAt={Date.now()} />);

    expect(html).toContain('data-preview-state="loading"');
    expect((html.match(/data-loading-tile=/g) || []).length).toBe(3);
    expect(html).toContain("正在生成图片");
  });

  it("renders every returned image in the multi-result grid", () => {
    const html = renderPreview(
      <StudioPreview {...baseProps} count={3} results={["/one.png", "/two.png", "/three.png"]} />,
    );

    expect(html).toContain('data-preview-state="results"');
    expect(html).toContain("3 张结果");
    expect((html.match(/data-result-card=/g) || []).length).toBe(3);
    expect(html).toContain("object-contain");
    expect(html).toContain('src="/three.png"');
  });

  it("shows the current backend generation context in the preview information rail", () => {
    const idle = renderPreview(<StudioPreview {...baseProps} />);
    expect(idle).toContain("输出参数");
    expect(idle).toContain("1:1");
    expect(idle).toContain("1K");
    expect(idle).toContain("1 张");
    expect(idle).toContain("生成完成后自动保存到作品");

    const loading = renderPreview(<StudioPreview {...baseProps} busy startedAt={Date.now()} />);
    expect(loading).toContain("任务已提交，完成后自动同步");

    const complete = renderPreview(<StudioPreview {...baseProps} results={["/one.png"]} />);
    expect(complete).toContain("已保存作品");
  });

  it("renders the complete preview interface in English", () => {
    const html = renderPreview(<StudioPreview {...baseProps} count={3} results={["/one.png", "/two.png", "/three.png"]} />, "en-US");

    expect(html).toContain("Generation preview");
    expect(html).toContain("3 results");
    expect(html).toContain("Output settings");
    expect(html).toContain("Saved to works");
    expect(html).not.toContain("生成预览");
  });

  it("keeps a generation failure visible in the preview panel", () => {
    const html = renderPreview(<StudioPreview {...baseProps} error="图片生成超时，请稍后重试" />);

    expect(html).toContain('data-preview-state="error"');
    expect(html).toContain("生成失败");
    expect(html).toContain("图片生成超时，请稍后重试");
  });

  it("does not present prompt optimization as an image generation task", () => {
    const html = renderPreview(<StudioPreview {...baseProps} optimizing />);

    expect(html).toContain('data-preview-state="empty"');
    expect(html).toContain("优化中");
    expect(html).not.toContain("正在生成图片");
  });


  it("keeps local editing visible in the enlarged image view", () => {
    const html = renderPreview(
      <StudioImageLightbox url="/one.png" onClose={() => undefined} onEdit={() => undefined} />,
    );

    expect(html).toContain('data-preview-lightbox="image"');
    expect(html).toContain('data-preview-action="local-edit"');
    expect(html).toContain("局部编辑");
  });

  it("keeps the accessible action label aligned with local processing", () => {
    const html = renderPreview(<StudioPreview {...baseProps} generateLabel="处理图片" />);

    expect(html).toContain('aria-label="处理图片"');
    expect(html).not.toContain('aria-label="生成"');
  });
});

describe("StudioPreview task controls", () => {
  it("exposes cancellation while an image task is active", () => {
    const html = renderPreview(<StudioPreview {...baseProps} busy startedAt={Date.now()} onCancel={() => undefined} />);
    expect(html).toContain("取消任务");
  });
});
