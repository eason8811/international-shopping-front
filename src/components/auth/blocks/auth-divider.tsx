import type { HTMLAttributes } from "react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface AuthDividerProps extends HTMLAttributes<HTMLDivElement> {
  label: string
}

export function AuthDivider({
  label,
  className,
  ...props
}: AuthDividerProps) {
  return (
    <div className={cn("flex w-full items-center py-8", className)} {...props}>
      <Separator className="flex-1 bg-(--separator-default)" />
      <span
        className={[
          "px-4 font-sans text-(length:--type-paragraph-mini-font-size)",
          "leading-(--type-paragraph-mini-line-height) tracking-(--type-paragraph-mini-letter-spacing) text-(--color-text-secondary)",
        ].join(" ")}
      >
        {label}
      </span>
      <Separator className="flex-1 bg-(--separator-default)" />
    </div>
  )
}
