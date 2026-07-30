import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/components/language-provider";

import { TextOverlayEditor } from "./text-overlay-editor";

describe("TextOverlayEditor", () => {
  it("renders the source image with a draggable text selection box", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLocale="zh-CN">
        <TextOverlayEditor
          sourceUrl="/source.png"
          text="星海新品"
          fontFamily="sans"
          fontSize={64}
          textColor="#FFFFFF"
          position="center"
          x={0}
          y={0}
          onPositionChange={() => undefined}
        />
      </LanguageProvider>,
    );
    expect(html).toContain('data-text-overlay-editor="true"');
    expect(html).toContain('src="/source.png"');
    expect(html).toContain("星海新品");
    expect(html).toContain('data-text-overlay-box="true"');
    expect(html).toContain("拖动文字调整位置");
  });
});
