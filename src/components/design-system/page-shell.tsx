"use client";

import type { ReactNode } from "react";

import { type DsPagePatternName, getPattern } from "@/lib/design-system/patterns";
import {
  dsDensityClassNames,
  dsSurfaceClassNames,
  getPatternStyle,
} from "@/lib/design-system/runtime";
import { cn } from "@/lib/utils";

import { DesignSystemPatternProvider } from "./pattern-provider";

export function DesignSystemPageShell({
  patternName,
  children,
  className,
}: {
  patternName: DsPagePatternName;
  children: ReactNode;
  className?: string;
}) {
  const pattern = getPattern(patternName);

  return (
    <DesignSystemPatternProvider patternName={patternName}>
      <main
        data-ds-pattern={patternName}
        data-ds-density={pattern.density}
        className={cn(
          "min-h-screen",
          dsSurfaceClassNames.page,
          dsDensityClassNames[pattern.density],
          className,
        )}
      >
        <div
          className="mx-auto flex w-full max-w-7xl flex-col gap-[var(--ds-page-section-gap)] px-[var(--ds-page-container-padding)] py-8 sm:py-10"
          style={getPatternStyle(patternName)}
        >
          {children}
        </div>
      </main>
    </DesignSystemPatternProvider>
  );
}
