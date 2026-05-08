import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const paragraphRegularClassName = [
  "text-(length:--type-paragraph-regular-font-size) font-normal",
  "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing)",
].join(" ")

const inputVariants = cva(
  [
    "w-full min-w-0 bg-transparent outline-none transition-colors",
    "disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)",
    "read-only:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "rounded-(--radius) border border-(--color-border-default) px-3 py-2",
          paragraphRegularClassName,
          "text-(--color-text-primary) placeholder:text-(--color-text-placeholder)",
          "focus-visible:border-(--color-border-focus) focus-visible:ring-0",
        ].join(" "),
        underline: [
          "h-6 border-0 px-0 py-0 shadow-none",
          paragraphRegularClassName,
          "text-(--input-underline-text-default) placeholder:text-(--input-underline-placeholder-default)",
          "focus-visible:ring-0",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type InputProps = React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants>

function Input({
  className,
  type,
  variant = "default",
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
}

type InputUnderlineFrameProps = React.ComponentProps<"div"> & {
  focused?: boolean
  invalid?: boolean
}

function InputUnderlineFrame({
  className,
  focused = false,
  invalid = false,
  ...props
}: InputUnderlineFrameProps) {
  const borderClassName = focused
    ? invalid
      ? "border-(--input-underline-border-invalid-focus)"
      : "border-(--input-underline-border-focus)"
    : invalid
      ? "border-[#eccdd0]"
      : "border-(--input-underline-border-default)"

  return (
    <div
      data-slot="input-underline-frame"
      data-focused={focused ? "true" : "false"}
      data-invalid={invalid ? "true" : "false"}
      className={cn(
        [
          "flex w-full items-center border-b-(length:--input-underline-border-width) border-solid",
          "gap-(--input-underline-content-gap) px-(--input-underline-content-padding-inline) py-(--input-underline-content-padding-block)",
        ].join(" "),
        borderClassName,
        className
      )}
      {...props}
    />
  )
}

function InputUnderlineDivider({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-underline-divider"
      className={cn("w-px self-stretch bg-(--separator-default)", className)}
      {...props}
    />
  )
}

export interface InputCountryCodeOption {
  value: string
  label: string
}

const defaultCountryCodeOptions = [
  { value: "+86", label: "+86 (CN)" },
  { value: "+1", label: "+1 (US)" },
  { value: "+34", label: "+34 (ES)" },
] as const satisfies ReadonlyArray<InputCountryCodeOption>

type InputCountryCodeSelectProps = {
  ariaLabel: string
  className?: string
  disabled?: boolean
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
  onFocus?: React.FocusEventHandler<HTMLButtonElement>
  onValueChange?: (value: string) => void
  options?: ReadonlyArray<InputCountryCodeOption>
  value?: string
}

function InputCountryCodeSelect({
  ariaLabel,
  className,
  disabled = false,
  onBlur,
  onFocus,
  onValueChange,
  options = defaultCountryCodeOptions,
  value,
}: InputCountryCodeSelectProps) {
  const resolvedOptions = options.length > 0 ? options : defaultCountryCodeOptions
  const resolvedValue = value ?? resolvedOptions[0]?.value ?? "+86"

  return (
    <Select
      disabled={disabled}
      value={resolvedValue}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          [
            "h-6 w-auto min-w-0 shrink-0 rounded-none border-0 bg-transparent px-0 py-0 shadow-none",
            paragraphRegularClassName,
            "text-(--input-underline-text-default) focus-visible:border-transparent",
            "[&_svg]:text-(--input-underline-text-default)",
          ].join(" "),
          className
        )}
        onBlur={onBlur}
        onFocus={onFocus}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {resolvedOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export {
  Input,
  InputCountryCodeSelect,
  InputUnderlineDivider,
  InputUnderlineFrame,
}
