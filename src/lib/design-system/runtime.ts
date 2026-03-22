import type { CSSProperties } from "react";

import { buttonRules, inputRules, popoverRules } from "./component-rules";
import { getPattern, type DsPagePatternName } from "./patterns";
import type { DsDensityMode, DsSurfaceRole, DsTextRole, DsTypographyRole } from "./tokens";

export const dsSurfaceClassNames: Record<DsSurfaceRole, string> = {
  page: "ds-surface-page",
  section: "ds-surface-section",
  card: "ds-surface-card",
  nested: "ds-surface-nested",
  raised: "ds-surface-raised",
  active: "ds-surface-active",
};

export const dsTextClassNames: Record<DsTextRole, string> = {
  strong: "ds-text-strong",
  default: "ds-text-default",
  muted: "ds-text-muted",
  subtle: "ds-text-subtle",
};

export const dsTypographyClassNames: Record<DsTypographyRole, string> = {
  displayXl: "ds-type-display-xl",
  displayLg: "ds-type-display-lg",
  headlineLg: "ds-type-headline-lg",
  headlineMd: "ds-type-headline-md",
  titleLg: "ds-type-title-lg",
  titleMd: "ds-type-title-md",
  bodyLg: "ds-type-body-lg",
  bodyMd: "ds-type-body-md",
  labelMd: "ds-type-label-md",
  dataSm: "ds-type-data-sm",
};

export const dsDensityClassNames: Record<DsDensityMode, string> = {
  airy: "ds-density-airy",
  balanced: "ds-density-balanced",
  compact: "ds-density-compact",
};

export function getPatternStyle(patternName: DsPagePatternName): CSSProperties {
  const pattern = getPattern(patternName);
  return {
    "--ds-page-section-gap": `var(--ds-space-${pattern.recommendedSectionGap})`,
    "--ds-page-container-padding": `var(--ds-space-${pattern.minimumContainerPadding})`,
  } as CSSProperties;
}

export function resolvePopoverVariantForPattern(
  requestedVariant: keyof typeof popoverRules.variants,
  patternName: DsPagePatternName,
): keyof typeof popoverRules.variants {
  if (requestedVariant !== "premium") {
    return requestedVariant;
  }

  return getPattern(patternName).allowGlass ? "premium" : "neutral";
}

export function getButtonDefaultVariant() {
  return buttonRules.defaults.variant;
}

export function getInputDefaultVariant() {
  return inputRules.defaults.variant;
}
