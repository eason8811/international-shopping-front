import { describe, expect, it } from "vitest";

import {
  badgeRules,
  buttonRules,
  cardRules,
  dialogRules,
  inputRules,
  popoverRules,
  sheetRules,
} from "@/lib/design-system/component-rules";
import { badgeSizeClassMap, badgeToneClassMap } from "@/components/design-system/primitives/badge";
import { buttonSizeClassMap, buttonVariantClassMap } from "@/components/design-system/primitives/button";
import { cardVariantClassMap } from "@/components/design-system/primitives/card";
import { dialogVariantClassMap } from "@/components/design-system/primitives/dialog";
import { inputDensityClassMap, inputVariantClassMap } from "@/components/design-system/primitives/input";
import { popoverVariantClassMap } from "@/components/design-system/primitives/popover";
import { sheetVariantClassMap } from "@/components/design-system/primitives/sheet";

describe("design-system primitive contracts", () => {
  it("keeps button variants and sizes aligned with component rules", () => {
    expect(Object.keys(buttonVariantClassMap)).toEqual(Object.keys(buttonRules.variants));
    expect(Object.keys(buttonSizeClassMap)).toEqual(Object.keys(buttonRules.sizes));
  });

  it("keeps contrast and destructive button visual contracts aligned with the editorial DS", () => {
    expect(buttonVariantClassMap.contrast).toContain("bg-card");
    expect(buttonVariantClassMap.contrast).toContain("text-[var(--ds-on-surface-strong)]");
    expect(buttonVariantClassMap.destructive).toContain("bg-card");
    expect(buttonVariantClassMap.destructive).toContain("text-[var(--ds-destructive)]");
  });

  it("keeps input variants and density aligned with component rules", () => {
    expect(Object.keys(inputVariantClassMap)).toEqual(Object.keys(inputRules.variants));
    expect(Object.keys(inputDensityClassMap)).toEqual(Object.keys(inputRules.densities));
  });

  it("keeps card variants aligned with component rules", () => {
    expect(Object.keys(cardVariantClassMap)).toEqual(Object.keys(cardRules.variants));
  });

  it("keeps badge tones and sizes aligned with component rules", () => {
    expect(Object.keys(badgeToneClassMap)).toEqual(Object.keys(badgeRules.tones));
    expect(Object.keys(badgeSizeClassMap)).toEqual(Object.keys(badgeRules.sizes));
  });

  it("keeps overlay variants aligned with component rules", () => {
    expect(Object.keys(popoverVariantClassMap)).toEqual(Object.keys(popoverRules.variants));
    expect(Object.keys(dialogVariantClassMap)).toEqual(Object.keys(dialogRules.variants));
    expect(Object.keys(sheetVariantClassMap)).toEqual(Object.keys(sheetRules.variants));
  });
});
