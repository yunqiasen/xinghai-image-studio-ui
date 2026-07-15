import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("commercial preference styling", () => {
  it("styles language and appearance as compact dropdowns", () => {
    expect(css).toContain(".preference-select-trigger");
    expect(css).toContain(".preference-select-content");
    expect(css).toContain(".preference-select-short");
    expect(css).not.toContain("grid-template-columns: repeat(3");
  });

  it("keeps colorful mode on the original restrained aurora palette", () => {
    expect(css).toContain("--commercial-bg: #eef3f7");
    expect(css).toContain("--commercial-accent: #2d6f82");
    expect(css).toContain("rgba(38,204,220,.34)");
    expect(css).toContain("rgba(255,105,154,.30)");
    expect(css).not.toContain("--commercial-colorful-cyan");
    expect(css).not.toContain("saturate(1.55)");
    expect(css).not.toContain(".theme-colorful .commercial-nav-link.is-active");
  });
});
