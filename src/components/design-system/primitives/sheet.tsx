"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import type { DsSheetVariant } from "@/lib/design-system/component-rules";
import { cn } from "@/lib/utils";

import { Button } from "./button";

export const sheetVariantClassMap = {
  mobileEditor:
    "inset-x-0 bottom-0 rounded-t-[var(--radius-xl)] border-x-0 border-b-0 bg-background md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-w-xl md:rounded-none md:rounded-l-[var(--radius-xl)] md:border md:border-r-0",
  sidePanel:
    "inset-y-0 right-0 h-full w-full max-w-xl rounded-none rounded-l-[var(--radius-xl)] border border-r-0 bg-background",
} as const satisfies Record<DsSheetVariant, string>;

export function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

export function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

export function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-[color:oklch(0.145_0_0_/_0.16)] supports-[backdrop-filter]:backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

export function SheetContent({
  className,
  children,
  variant = "mobileEditor",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  variant?: DsSheetVariant;
  showCloseButton?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-variant={variant}
        className={cn(
          "fixed z-50 flex flex-col gap-5 border-[color:var(--ds-ghost-border)] p-6 shadow-[var(--shadow-ambient-md)] outline-none",
          sheetVariantClassMap[variant],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <SheetPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 size-10"
              aria-label="Close sheet"
            >
              <XIcon />
            </Button>
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-3", className)} {...props} />;
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("ds-type-headline-md text-[var(--ds-on-surface-strong)]", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("ds-type-body-md text-[var(--ds-on-surface-muted)]", className)}
      {...props}
    />
  );
}
