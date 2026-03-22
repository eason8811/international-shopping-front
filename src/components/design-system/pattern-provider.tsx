"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  getPattern,
  type DsPagePatternName,
  type DsPatternDefinition,
} from "@/lib/design-system/patterns";
import { resolvePopoverVariantForPattern } from "@/lib/design-system/runtime";

interface DesignSystemPatternContextValue {
  patternName: DsPagePatternName;
  pattern: DsPatternDefinition;
}

const DesignSystemPatternContext = createContext<DesignSystemPatternContextValue | null>(null);

export function DesignSystemPatternProvider({
  patternName,
  children,
}: {
  patternName: DsPagePatternName;
  children: ReactNode;
}) {
  return (
    <DesignSystemPatternContext.Provider
      value={{
        patternName,
        pattern: getPattern(patternName),
      }}
    >
      {children}
    </DesignSystemPatternContext.Provider>
  );
}

export function useDesignSystemPattern() {
  return useContext(DesignSystemPatternContext);
}

export function useGlassSafePopoverVariant(
  requestedVariant: "neutral" | "premium",
): "neutral" | "premium" {
  const context = useDesignSystemPattern();
  if (!context) {
    return requestedVariant;
  }

  return resolvePopoverVariantForPattern(requestedVariant, context.patternName);
}

export function usePatternAllowsGlass(): boolean {
  return useDesignSystemPattern()?.pattern.allowGlass ?? false;
}
