import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AuthCodeResendCopy {
  prompt: string
  actionLabel: string
  countdownLabel: string
}

interface AuthCodeResendProps extends AuthCodeResendCopy {
  remainingSeconds: number
  pending?: boolean
  onResend: () => void
  className?: string
}

export function AuthCodeResend({
  prompt,
  actionLabel,
  remainingSeconds,
  countdownLabel,
  pending = false,
  onResend,
  className,
}: AuthCodeResendProps) {
  if (remainingSeconds > 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <CheckIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-(--color-text-success)"
        />
        <span
          className={[
            "font-sans text-(length:--type-paragraph-small-font-size) font-semibold",
            "leading-(--type-paragraph-small-line-height) tracking-(--type-paragraph-small-letter-spacing) text-(--color-text-secondary)",
          ].join(" ")}
        >
          {countdownLabel}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={[
          "font-sans text-(length:--type-paragraph-small-font-size) font-semibold",
          "leading-(--type-paragraph-small-line-height) tracking-(--type-paragraph-small-letter-spacing) text-(--color-text-secondary)",
        ].join(" ")}
      >
        {prompt}
      </span>
      <Button
        disabled={pending}
        size="small"
        type="button"
        variant="link"
        onClick={onResend}
      >
        {actionLabel}
      </Button>
    </div>
  )
}
