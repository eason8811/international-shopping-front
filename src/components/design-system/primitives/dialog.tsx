"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import type { DsDialogVariant } from "@/lib/design-system/component-rules";
import { cn } from "@/lib/utils";

import { usePatternAllowsGlass } from "../pattern-provider";
import { Button } from "./button";

export const dialogVariantClassMap = {
  default:
    "bg-card text-[var(--ds-on-surface)] shadow-[var(--shadow-ambient-md)]",
  premium:
    "bg-[var(--ds-glass-fill-strong)] text-[var(--ds-on-surface)] shadow-[var(--shadow-ambient-lg)] supports-[backdrop-filter]:backdrop-blur-[var(--ds-glass-blur-lg)]",
} as const satisfies Record<DsDialogVariant, string>;

function resolveDialogVariant(
  requestedVariant: DsDialogVariant,
  allowGlass: boolean,
): DsDialogVariant {
  if (requestedVariant !== "premium") {
    return requestedVariant;
  }

  return allowGlass ? "premium" : "default";
}

export function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-[color:oklch(0.145_0_0_/_0.18)] supports-[backdrop-filter]:backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  variant = "default",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  variant?: DsDialogVariant;
  showCloseButton?: boolean;
}) {
  const resolvedVariant = resolveDialogVariant(variant, usePatternAllowsGlass());

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-variant={resolvedVariant}
        data-glass-downgraded={variant === "premium" && resolvedVariant !== variant}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-5 rounded-[var(--radius-xl)] border border-[color:var(--ds-ghost-border)] p-6 outline-none",
          dialogVariantClassMap[resolvedVariant],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 size-10"
              aria-label="Close dialog"
            >
              <XIcon />
            </Button>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("ds-type-headline-md text-[var(--ds-on-surface-strong)]", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("ds-type-body-md text-[var(--ds-on-surface-muted)]", className)}
      {...props}
    />
  );
}
