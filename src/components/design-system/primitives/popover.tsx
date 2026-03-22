"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";

import type { DsPopoverVariant } from "@/lib/design-system/component-rules";
import { popoverRules } from "@/lib/design-system/component-rules";
import { cn } from "@/lib/utils";

import { useGlassSafePopoverVariant } from "../pattern-provider";

export const popoverVariantClassMap = {
  neutral:
    "bg-card text-[var(--ds-on-surface)] border-[color:var(--ds-ghost-border)] shadow-[var(--shadow-ambient-sm)]",
  premium:
    "bg-[var(--ds-glass-fill-strong)] text-[var(--ds-on-surface)] border-[color:var(--ds-glass-border)] shadow-[var(--shadow-ambient-sm)] supports-[backdrop-filter]:backdrop-blur-[var(--ds-glass-blur-sm)]",
} as const satisfies Record<DsPopoverVariant, string>;

export function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export function PopoverContent({
  className,
  align = "center",
  sideOffset = 10,
  variant = popoverRules.defaults.variant,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  variant?: DsPopoverVariant;
}) {
  const resolvedVariant = useGlassSafePopoverVariant(variant);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        data-variant={resolvedVariant}
        data-glass-downgraded={variant === "premium" && resolvedVariant !== variant}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-80 origin-(--radix-popover-content-transform-origin) rounded-[var(--radius-xl)] border p-5 outline-none transition-[opacity,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          popoverVariantClassMap[resolvedVariant],
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="popover-title"
      className={cn("ds-type-title-lg text-[var(--ds-on-surface-strong)]", className)}
      {...props}
    />
  );
}

export function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("ds-type-body-md text-[var(--ds-on-surface-muted)]", className)}
      {...props}
    />
  );
}
