import * as React from "react";

import type { DsCardVariant } from "@/lib/design-system/component-rules";
import { cardRules } from "@/lib/design-system/component-rules";
import { cn } from "@/lib/utils";

export const cardVariantClassMap = {
  base: "bg-card rounded-[var(--radius-lg)]",
  nested: "bg-[var(--ds-surface-container)] rounded-[var(--radius-lg)]",
  elevated: "bg-card rounded-[var(--radius-lg)] shadow-[var(--shadow-ambient-md)]",
  editorial: "bg-card rounded-[var(--radius-xl)]",
} as const satisfies Record<DsCardVariant, string>;

export const Card = React.forwardRef<
  HTMLElement,
  React.ComponentProps<"section"> & {
    variant?: DsCardVariant;
  }
>(function Card(
  {
    className,
    variant = cardRules.defaults.variant,
    children,
    ...props
  },
  ref,
) {
  return (
    <section
      ref={ref}
      data-slot="card"
      data-variant={variant}
      className={cn("group/card flex flex-col gap-6 overflow-hidden", cardVariantClassMap[variant], className)}
      {...props}
    >
      {children}
    </section>
  );
});

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2 px-6 pt-6", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("ds-type-title-lg text-[var(--ds-on-surface-strong)]", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("ds-type-body-md text-[var(--ds-on-surface-muted)]", className)}
      {...props}
    />
  );
}

export function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("flex items-center gap-2 self-start md:self-end", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-col gap-4 px-6 pb-6", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex flex-wrap items-center gap-3 px-6 pb-6", className)}
      {...props}
    />
  );
}
