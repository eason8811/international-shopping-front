import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface AuthSuccessPanelProps {
  title: string
  description: string
  className?: string
}

export function AuthSuccessPanel({
  title,
  description,
  className,
}: AuthSuccessPanelProps) {
  return (
    <div className={cn("flex w-full flex-col items-center gap-6 py-8", className)}>
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-(--color-surface-success) opacity-25" />
        <span className="absolute inset-3 rounded-full bg-(--color-surface-success)" />
        <CheckIcon
          aria-hidden="true"
          className="relative z-10 size-6 text-(--color-text-inverse)"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-2 text-center">
        <h2
          className={[
            "font-sans text-(length:--type-paragraph-xl-font-size) font-semibold",
            "leading-(--type-paragraph-xl-line-height) tracking-(--type-paragraph-xl-letter-spacing) text-(--color-text-primary)",
          ].join(" ")}
        >
          {title}
        </h2>
        <p
          className={[
            "max-w-sm font-sans text-(length:--type-paragraph-small-font-size)",
            "leading-(--type-paragraph-small-line-height) tracking-(--type-paragraph-small-letter-spacing) text-(--color-text-secondary)",
          ].join(" ")}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
