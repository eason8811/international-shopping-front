"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"

import { toneTransitionClassName } from "@/lib/motion/classes"
import { cn } from "@/lib/utils"

function Select(
  props: React.ComponentProps<typeof SelectPrimitive.Root>
) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup(
  props: React.ComponentProps<typeof SelectPrimitive.Group>
) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        [
          "inline-flex w-full items-center justify-between gap-2 rounded-(--radius) border border-(--color-border-default)",
          "bg-(--color-surface-default) px-3 py-2 text-left outline-none",
          toneTransitionClassName,
          "text-(length:--type-paragraph-regular-font-size) font-normal leading-(--type-paragraph-regular-line-height)",
          "tracking-(--type-paragraph-regular-letter-spacing) text-(--color-text-primary)",
          "focus-visible:border-(--color-border-focus)",
          "disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)",
          "data-placeholder:text-(--color-text-placeholder)",
          "[&_svg]:shrink-0",
        ].join(" "),
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 text-(--color-text-secondary)" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          [
            "relative z-50 min-w-32 overflow-hidden rounded-(--radius) border border-(--color-border-default)",
            "bg-(--color-surface-default) text-(--color-text-primary) shadow-sm",
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1",
            "data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          ].join(" "),
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton
          className="flex cursor-default items-center justify-center py-1"
        >
          <ChevronUpIcon className="size-4 text-(--color-text-secondary)" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "w-full min-w-(--radix-select-trigger-width)"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton
          className="flex cursor-default items-center justify-center py-1"
        >
          <ChevronDownIcon className="size-4 text-(--color-text-secondary)" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-2 py-1.5 text-(length:--type-caption-tiny-font-size) font-bold uppercase leading-(--type-caption-tiny-line-height) tracking-(--type-caption-tiny-letter-spacing) text-(--color-text-secondary)",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        [
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1 pr-8 pl-1.5 outline-none",
          "text-(length:--type-paragraph-regular-font-size) font-normal leading-(--type-paragraph-regular-line-height)",
          "tracking-(--type-paragraph-regular-letter-spacing) text-(--color-text-primary)",
          "data-highlighted:bg-(--color-surface-subtle)",
          "data-disabled:pointer-events-none data-disabled:opacity-(--state-opacity-disabled)",
        ].join(" "),
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("mx-1 my-1 h-px bg-(--separator-default)", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
