"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { motionTokens } from "@/lib/motion/tokens";
import { Button } from "@/components/ui/button"
import { fadeSwap } from "@/lib/motion/recipes"
import { cn } from "@/lib/utils"

export interface AuthFooterLinkCopy {
  prompt: string
  actionLabel: string
}

interface AuthFooterLinkProps extends AuthFooterLinkCopy {
  onAction: () => void
  className?: string
}

export function AuthFooterLink({
  prompt,
  actionLabel,
  onAction,
  className,
}: AuthFooterLinkProps) {
  const reducedMotion = useReducedMotion() ?? false
  const footerSwap = fadeSwap({
    reducedMotion,
    distance: motionTokens.distance.sm,
  })
  const motionKey = `${prompt}::${actionLabel}`

  return (
    <div className={cn(className)}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={motionKey}
          animate="visible"
          className="flex items-start justify-center gap-1 text-center"
          exit="exit"
          initial="hidden"
          variants={footerSwap}
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
