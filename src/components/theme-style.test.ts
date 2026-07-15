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

  it("gives colorful mode a saturated five-color aurora distinct from light mode", () => {
    expect(css).toContain("--commercial-colorful-cyan");
    expect(css).toContain("--commercial-colorful-blue");
    expect(css).toContain("--commercial-colorful-violet");
    expect(css).toContain("--commercial-colorful-pink");
    expect(css).toContain("--commercial-colorful-gold");
    expect(css).toContain(".theme-colorful .commercial-nav-link.is-active");
    expect(css).toContain(".theme-colorful .studio-ambient-mesh");
    expect(css).toContain("saturate(1.55)");
  });
});
