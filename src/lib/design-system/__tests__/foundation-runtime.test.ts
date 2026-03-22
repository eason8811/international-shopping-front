import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
const localeLayout = readFileSync(resolve(process.cwd(), "src/app/[locale]/layout.tsx"), "utf8");

describe("foundation runtime closure", () => {
  it("binds typography runtime tokens in globals.css", () => {
    expect(globalsCss).toContain("--ds-type-display-xl-font-family: var(--font-serif);");
    expect(globalsCss).toContain("--ds-type-data-sm-font-family: var(--font-mono);");
    expect(globalsCss).toContain(".ds-type-headline-md {");
    expect(globalsCss).toContain(".ds-density-balanced {");
  });

  it("keeps popover alias neutral by default", () => {
    expect(globalsCss).toContain("--popover: var(--ds-surface-container-lowest);");
    expect(globalsCss).not.toContain("--popover: var(--ds-glass-fill-strong);");
  });

  it("loads the full local font stack in the locale layout", () => {
    expect(localeLayout).toContain("Newsreader-Variable.ttf");
    expect(localeLayout).toContain("JetBrainsMono-Variable.ttf");
    expect(localeLayout).toContain('variable: "--font-serif"');
    expect(localeLayout).toContain('variable: "--font-mono"');
  });
});
