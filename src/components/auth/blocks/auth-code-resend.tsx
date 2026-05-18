"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { fadeSwap } from "@/lib/motion/recipes"
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
  const reducedMotion = useReducedMotion() ?? false
  const [canAnimateSwap, setCanAnimateSwap] = React.useState(false)
  const resendSwap = fadeSwap({reducedMotion})
  const isCountdownActive = remainingSeconds > 0
  const motionKey = isCountdownActive ? "countdown" : "action"

  React.useEffect(() => {
    setCanAnimateSwap(true)
  }, [])

  return (
    <div className={cn("flex justify-center items-center gap-2", className)}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={motionKey}
          animate="visible"
          className="flex items-center justify-center gap-2"
          exit="exit"
          initial={canAnimateSwap ? "hidden" : false}
          variants={resendSwap}
        >
          {isCountdownActive ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
