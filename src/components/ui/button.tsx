import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap",
    "transition-[color,background-color,border-color,box-shadow,opacity]",
    "disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)",
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
          "data-[status=loading]:border-(--button-primary-border-default) data-[status=loading]:bg-(--button-primary-container-loading)",
          "data-[status=success]:border-(--button-primary-border-default) data-[status=success]:bg-(--button-primary-container-success)",
        ].join(" "),
        secondary: [
          "rounded-(--button-large-radius) border-(length:--button-secondary-border-width) border-solid",
          "border-(--button-secondary-border-default) bg-(--button-secondary-container-default) text-(--button-secondary-text-default)",
          "hover:bg-(--button-secondary-container-hover) active:bg-(--button-secondary-container-active)",
          "data-[status=loading]:border-(--button-secondary-border-default) data-[status=loading]:bg-(--button-secondary-container-loading)",
          "data-[status=success]:border-(--button-secondary-border-default) data-[status=success]:bg-(--button-secondary-container-success)",
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
          "border-x-0 border-t-0 border-b-(length:--button-link-border-width) border-dashed",
          "border-(--button-link-border-default) bg-transparent text-(--button-link-text-default)",
          "hover:border-(--button-link-border-hover) active:border-(--button-link-border-active)",
        ].join(" "),
        naked: [
          "border border-transparent bg-transparent text-(--button-naked-text-default)",
          "hover:text-(--button-naked-text-hover) active:text-(--button-naked-text-active)",
        ].join(" "),
        "naked-icon": [
          "size-6 border border-transparent bg-transparent text-(--button-naked-icon-default)",
          "hover:text-(--button-naked-icon-hover) active:text-(--button-naked-icon-active)",
        ].join(" "),
        "naked-icon-inline": [
          "size-4 border border-transparent bg-transparent text-(--button-naked-icon-inline)",
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
          "gap-0 px-(--button-link-padding-inline) py-(--button-link-padding-block)",
          "text-(length:--type-paragraph-small-wider-font-size) font-semibold",
          "leading-(--type-paragraph-small-wider-line-height) tracking-(--type-paragraph-small-wider-letter-spacing)",
          "**:data-[icon=inline-start]:size-4 **:data-[icon=inline-end]:size-4",
        ].join(" "),
        tiny: [
          "gap-0 px-0 py-0 text-(length:--type-caption-tiny-font-size) font-semibold uppercase",
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
        variant: "link",
        size: "small",
        className: "rounded-(--button-small-radius)",
      },
      {
        variant: "link",
        size: "mini",
        className: "rounded-(--button-mini-radius)",
      },
      {
        variant: "naked",
        size: "default",
        className: "rounded-(--button-default-radius)",
      },
      {
        variant: "naked",
        size: "tiny",
        className: "rounded-(--button-tiny-radius)",
      },
      {
        variant: "naked-icon",
        size: "default",
        className: "rounded-(--button-default-radius)",
      },
      {
        variant: "naked-icon-inline",
        size: "tiny",
        className: "rounded-(--button-tiny-radius)",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonStatus = "idle" | "loading" | "success"

interface ButtonStatusCopy {
  loading: string
  success: string
}

const defaultButtonStatusCopy = {
  loading: "Loading",
  success: "Success",
} satisfies ButtonStatusCopy

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string
  asChild?: boolean
  status?: ButtonStatus
  statusCopy?: ButtonStatusCopy
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

function ButtonStatusContent({
  status,
  statusCopy,
}: {
  status: Exclude<ButtonStatus, "idle">
  statusCopy: ButtonStatusCopy
}) {
  const label = status === "loading" ? statusCopy.loading : statusCopy.success

  return (
    <span
      aria-atomic="true"
      aria-live="polite"
      className="flex items-center justify-center"
      data-slot="button-status-content"
      role="status"
    >
      {status === "loading" ? (
        <LoaderCircleIcon
          aria-hidden="true"
          className="size-5 animate-spin"
          data-slot="button-status-icon"
        />
      ) : (
        <CheckIcon
          aria-hidden="true"
          className="size-5"
          data-slot="button-status-icon"
        />
      )}
      <span className="sr-only">{label}</span>
    </span>
  )
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  status = "idle",
  statusCopy = defaultButtonStatusCopy,
  ...props
}: ButtonProps) {
  if (asChild) {
    const slotProps = props as React.ComponentProps<typeof Slot.Root>

    return (
      <Slot.Root
        data-slot="button"
        data-size={size}
        data-status={status}
        data-variant={variant}
        className={cn(buttonVariants({ variant, size, className }))}
        {...slotProps}
      />
    )
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>
  const { children, disabled: nativeDisabled, ...nativeProps } = buttonProps
  const showsStatusIconOnly =
    status !== "idle" &&
    size === "large" &&
    (variant === "primary" || variant === "secondary")
  const disabled = nativeDisabled || showsStatusIconOnly

  return (
    <button
      {...nativeProps}
      data-slot="button"
      data-status={status}
      data-variant={variant}
      data-size={size}
      disabled={disabled}
      type={buttonProps.type ?? "button"}
      className={cn(buttonVariants({ variant, size, className }))}
    >
      {showsStatusIconOnly ? (
        <ButtonStatusContent status={status} statusCopy={statusCopy} />
      ) : (
        children
      )}
    </button>
  )
}

export { Button, buttonVariants, type ButtonStatus, type ButtonStatusCopy }
