import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import type { DsButtonSize, DsButtonVariant } from "@/lib/design-system/component-rules";
import { buttonRules } from "@/lib/design-system/component-rules";
import { cn } from "@/lib/utils";

export const buttonVariantClassMap = {
  primary:
    "border-transparent bg-primary text-primary-foreground hover:opacity-95 focus-visible:ring-[color:var(--ds-primary)]/25",
  secondary:
    "border-[color:var(--ds-ghost-border)] bg-card text-[var(--ds-on-surface-strong)] hover:bg-[var(--ds-surface-container-low)]",
  contrast:
    "border-transparent bg-card text-[var(--ds-on-surface-strong)] hover:opacity-95 focus-visible:ring-[color:var(--ds-primary)]/25",
  ghost:
    "border-transparent bg-transparent text-[var(--ds-primary-dim)] hover:bg-[var(--ds-surface-container-low)] hover:text-[var(--ds-on-surface)]",
  destructive:
    "border-transparent bg-card text-[var(--ds-destructive)] hover:opacity-95 focus-visible:ring-[color:var(--ds-destructive)]/20",
} as const satisfies Record<DsButtonVariant, string>;

export const buttonSizeClassMap = {
  sm: "h-9 px-3 ds-type-body-md rounded-[var(--radius-md)]",
  md: "h-11 px-4 ds-type-title-md rounded-[var(--radius-lg)]",
  lg: "h-12 px-5 ds-type-title-md rounded-[var(--radius-lg)]",
  icon: "size-11 rounded-full ds-type-title-md",
} as const satisfies Record<DsButtonSize, string>;

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 border font-medium whitespace-nowrap outline-none transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)] select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/40 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 [&_svg[data-icon=inline-end]]:order-last",
  {
    variants: {
      variant: buttonVariantClassMap,
      size: buttonSizeClassMap,
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: buttonRules.defaults.variant,
      size: buttonRules.defaults.size,
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant = buttonRules.defaults.variant,
  size = buttonRules.defaults.size,
  fullWidth = false,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
