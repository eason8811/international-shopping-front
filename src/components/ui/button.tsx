import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors outline-none",
    "disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)",
    "data-[pending=true]:pointer-events-none data-[pending=true]:opacity-(--state-opacity-loading)",
    "**:data-[icon=inline-start]:shrink-0 **:data-[icon=inline-end]:shrink-0",
    "**:data-[icon=inline-start]:pointer-events-none **:data-[icon=inline-end]:pointer-events-none cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "rounded-(--button-large-radius) border-(length:--button-primary-border-width) border-solid",
          "border-(--button-primary-border-default) bg-(--button-primary-container-default) text-(--button-primary-text-default)",
          "hover:bg-(--button-primary-container-hover) active:bg-(--button-primary-container-active)",
        ].join(" "),
        primary: [
          "rounded-(--button-large-radius) border-(length:--button-primary-border-width) border-solid",
          "border-(--button-primary-border-default) bg-(--button-primary-container-default) text-(--button-primary-text-default)",
          "hover:bg-(--button-primary-container-hover) active:bg-(--button-primary-container-active)",
        ].join(" "),
        secondary: [
          "rounded-(--button-large-radius) border-(length:--button-secondary-border-width) border-solid",
          "border-(--button-secondary-border-default) bg-(--button-secondary-container-default) text-(--button-secondary-text-default)",
          "hover:bg-(--button-secondary-container-hover) active:bg-(--button-secondary-container-active)",
        ].join(" "),
        outline: [
          "rounded-(--button-large-radius) border-(--button-outline-border-default) border-(length:--button-secondary-border-width) border-solid",
          "bg-(--button-outline-container-default) text-(--button-outline-text-default)",
          "hover:bg-(--button-outline-container-hover) active:bg-(--button-outline-container-active)",
        ].join(" "),
        ghost: [
          "rounded-(--button-large-radius) border border-transparent",
          "bg-(--button-ghost-container-default) text-(--button-ghost-text-default)",
          "hover:bg-(--button-ghost-container-hover) active:bg-(--button-ghost-container-active)",
        ].join(" "),
        destructive: [
          "rounded-(--button-large-radius) border-(length:--button-secondary-border-width) border-solid",
          "border-(--button-secondary-border-default) bg-(--button-destructive-container-default) text-(--button-destructive-text-default)",
          "hover:text-(--button-destructive-text-hover) active:text-(--button-destructive-text-active)",
        ].join(" "),
        link: [
          "rounded-none border-x-0 border-t-0 border-b-(length:--button-link-border-width) border-dashed",
          "border-(--button-link-border-default) bg-transparent text-(--button-link-text-default)",
          "hover:border-(--button-link-border-hover) active:border-(--button-link-border-active)",
        ].join(" "),
        naked: [
          "rounded-none border border-transparent bg-transparent text-(--button-naked-text-default)",
          "hover:text-(--button-naked-text-hover) active:text-(--button-naked-text-active)",
        ].join(" "),
        "naked-icon": [
          "size-6 rounded-none border border-transparent bg-transparent text-(--button-naked-icon-default)",
          "hover:text-(--button-naked-icon-hover) active:text-(--button-naked-icon-active)",
        ].join(" "),
        "naked-icon-inline": [
          "size-4 rounded-none border border-transparent bg-transparent text-(--button-naked-icon-inline)",
          "hover:text-(--button-naked-icon-hover) active:text-(--button-naked-icon-active)",
        ].join(" "),
      },
      size: {
        large: [
          "gap-(--button-large-gap) px-(--button-large-padding-inline) py-(--button-large-padding-block)",
          "text-(length:--type-paragraph-small-font-size) font-semibold leading-(--type-paragraph-small-line-height)",
          "tracking-(--type-paragraph-small-letter-spacing)",
          "**:data-[icon=inline-start]:size-4 **:data-[icon=inline-end]:size-4",
        ].join(" "),
        default: [
          "gap-2 px-0 py-0 text-(length:--type-paragraph-regular-font-size) font-semibold",
          "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing)",
          "**:data-[icon=inline-start]:size-4 **:data-[icon=inline-end]:size-4",
        ].join(" "),
        small: [
          "gap-1 px-0 py-0 text-(length:--type-caption-tiny-font-size) font-semibold uppercase",
          "leading-(--type-caption-tiny-line-height) tracking-(--type-caption-tiny-letter-spacing)",
          "**:data-[icon=inline-start]:size-4 **:data-[icon=inline-end]:size-4",
        ].join(" "),
        mini: [
          "gap-0 px-(--button-link-padding-inline) py-(--button-link-padding-block)",
          "text-(length:--type-paragraph-mini-font-size) font-bold leading-(--type-paragraph-mini-line-height)",
          "tracking-(--type-paragraph-mini-letter-spacing)",
        ].join(" "),
        icon: "size-6",
      },
    },
    compoundVariants: [
      {
        variant: ["naked", "naked-icon", "naked-icon-inline"],
        size: ["default", "small", "mini"],
        className: "rounded-none",
      },
      {
        variant: "link",
        size: "small",
        className: [
          "text-(length:--type-paragraph-small-wider-font-size) font-semibold",
          "leading-(--type-paragraph-small-wider-line-height) tracking-(--type-paragraph-small-wider-letter-spacing)",
        ].join(" "),
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string
  asChild?: boolean
}

type ButtonAsChildProps = ButtonBaseProps &
  Omit<React.ComponentProps<typeof Slot.Root>, keyof ButtonBaseProps> & {
    asChild: true
  }

type ButtonNativeProps = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    asChild?: false
  }

type ButtonProps = ButtonAsChildProps | ButtonNativeProps

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  if (asChild) {
    const slotProps = props as React.ComponentProps<typeof Slot.Root>

    return (
      <Slot.Root
        data-slot="button"
        data-size={size}
        data-variant={variant}
        className={cn(buttonVariants({ variant, size, className }))}
        {...slotProps}
      />
    )
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={buttonProps.type ?? "button"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...buttonProps}
    />
  )
}

export { Button, buttonVariants }
