import * as React from "react";
import { Slot } from "radix-ui";

import type { DsBadgeTone } from "@/lib/design-system/component-rules";
import { badgeRules } from "@/lib/design-system/component-rules";
import { cn } from "@/lib/utils";

export const badgeToneClassMap = {
  neutral: "bg-[var(--ds-surface-container-high)] text-[var(--ds-on-surface)]",
  success: "bg-[var(--ds-success-soft)] text-[var(--ds-success-foreground)]",
  warning: "bg-[var(--ds-warning-soft)] text-[var(--ds-warning-foreground)]",
  destructive: "bg-destructive text-destructive-foreground",
  defaultAddress: "bg-[var(--ds-surface-container-high)] text-[var(--ds-on-surface-strong)]",
} as const satisfies Record<DsBadgeTone, string>;

export const badgeSizeClassMap = {
  sm: "min-h-6 px-2 ds-type-label-md",
  md: "min-h-7 px-2.5 ds-type-label-md",
} as const;

export function Badge({
  className,
  tone = badgeRules.defaults.tone,
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & {
  tone?: DsBadgeTone;
  size?: keyof typeof badgeSizeClassMap;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-tone={tone}
      data-size={size}
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-transparent font-medium whitespace-nowrap",
        badgeToneClassMap[tone],
        badgeSizeClassMap[size],
        className,
      )}
      {...props}
    />
  );
}
