import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    "w-full min-w-0 bg-transparent text-(--color-text-primary) outline-none transition-colors",
    "placeholder:text-(--color-text-placeholder) disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)",
    "read-only:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "h-8 rounded-lg border border-input px-2.5 py-1 text-base",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        ].join(" "),
        underline: [
          "h-6 border-0 px-0 py-0 text-(length:--type-paragraph-regular-font-size)",
          "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing)",
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
      className={cn(
        inputVariants({ variant }),
        className
      )}
      {...props}
    />
  )
}

export { Input }
