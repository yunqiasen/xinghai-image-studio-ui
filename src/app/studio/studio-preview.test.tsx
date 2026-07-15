import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "@/components/theme-provider";

import { StudioPreview } from "./studio-preview";

function renderPreview(element: ReactNode) {
  return renderToStaticMarkup(<ThemeProvider>{element}</ThemeProvider>);
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
    expect(html).toContain('src="/three.png"');
  });

  it("shows the current backend generation context in the preview information rail", () => {
    const idle = renderPreview(<StudioPreview {...baseProps} />);
    expect(idle).toContain("GPT Image 2.0");
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

  it("keeps a generation failure visible in the preview panel", () => {
    const html = renderPreview(<StudioPreview {...baseProps} error="图片生成超时，请稍后重试" />);

    expect(html).toContain('data-preview-state="error"');
    expect(html).toContain("生成失败");
    expect(html).toContain("图片生成超时，请稍后重试");
  });
});
