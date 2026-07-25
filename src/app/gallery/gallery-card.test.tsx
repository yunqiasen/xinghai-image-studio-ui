import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";
import type { GalleryItem } from "@/lib/storage/local-session";

import * as galleryCardModule from "./gallery-card";

const { GalleryCard } = galleryCardModule;

const item: GalleryItem = {
  id: "gallery-1",
  url: "/p/img/task-1/0?exp=1&sig=test",
  prompt: "这是一个很长的提示词，不应该被拿来作为图片的替代文本",
  mode: "text",
  createdAt: "2026-07-25T10:00:00Z",
};

describe("GalleryCard", () => {
  it("uses a short accessible alt and exposes work actions", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN">
        <GalleryCard
          index={0}
          item={item}
          onDownload={() => undefined}
          onLocalEdit={() => undefined}
          onOpen={() => undefined}
          onVariation={() => undefined}
        />
      </LanguageProvider>,
    );

    expect(html).toContain('data-gallery-card="gallery-1"');
    expect(html).toContain('alt="第 1 张作品"');
    expect(html).not.toContain(`alt="${item.prompt}"`);
    expect(html).toContain("整体变化");
    expect(html).toContain("局部编辑");
    expect(html).toContain("下载");
    expect(html).toContain('data-gallery-action="variation"');
    expect(html).toContain('data-gallery-action="local-edit"');
  });
});


describe("GalleryUnavailableHistory", () => {
  it("compacts unavailable works without offering broken image actions", () => {
    const GalleryUnavailableHistory = (galleryCardModule as typeof galleryCardModule & {
      GalleryUnavailableHistory?: (props: { items: GalleryItem[]; onRetry: (item: GalleryItem) => void }) => React.ReactNode;
    }).GalleryUnavailableHistory;

    expect(GalleryUnavailableHistory).toBeTypeOf("function");
    if (!GalleryUnavailableHistory) return;

    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN">
        <GalleryUnavailableHistory items={[item, { ...item, id: "gallery-2" }]} onRetry={() => undefined} />
      </LanguageProvider>,
    );

    expect(html).toContain('data-gallery-unavailable-count="2"');
    expect(html).toContain("2 条历史作品源图已失效");
    expect(html).toContain("展开查看记录");
    expect(html).not.toContain("整体变化");
    expect(html).not.toContain("局部编辑");
    expect(html).not.toContain("下载图片");
  });
});
