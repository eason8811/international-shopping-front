import { Ampersand } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LogoLockupProps {
  brandLabel: string
  className?: string
}

export function LogoLockup({ brandLabel, className }: LogoLockupProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2.5 overflow-visible whitespace-nowrap",
        className
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden">
        <Ampersand
          aria-hidden="true"
          className="size-4 shrink-0 text-(--button-naked-text-active)"
          strokeWidth={1.75}
        />
      </span>
      <Button
        asChild
        size="default"
        variant="naked"
        className={[
          "shrink-0 whitespace-nowrap font-serif text-(length:--type-brand-large-font-size) leading-(--type-brand-large-line-height)",
          "font-semibold italic tracking-(--type-brand-large-letter-spacing) text-(--button-naked-text-active)",
        ].join(" ")}
      >
        <span>{brandLabel}</span>
      </Button>
    </div>
  )
}
