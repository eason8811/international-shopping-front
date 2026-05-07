import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AuthFooterLinkProps {
  prompt: string
  actionLabel: string
  onAction: () => void
  className?: string
}

export function AuthFooterLink({
  prompt,
  actionLabel,
  onAction,
  className,
}: AuthFooterLinkProps) {
  return (
    <div className={cn("flex items-start justify-center gap-1 text-center", className)}>
      <span
        className={[
          "font-sans text-(length:--type-paragraph-mini-font-size)",
          "leading-(--type-paragraph-mini-line-height) tracking-(--type-paragraph-mini-letter-spacing) text-(--color-text-secondary)",
        ].join(" ")}
      >
        {prompt}
      </span>
      <Button size="mini" type="button" variant="link" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}
