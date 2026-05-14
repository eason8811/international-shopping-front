"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { fadeSwap } from "@/lib/motion/recipes"
import { motionTokens } from "@/lib/motion/tokens"
import { cn } from "@/lib/utils"
import { getAuthPageEnterItemProps } from "@/features/auth/ui/auth-stagger"

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
  const [canAnimateSwap, setCanAnimateSwap] = React.useState(false)
  const footerSwap = fadeSwap({
    reducedMotion,
    distance: motionTokens.distance.sm,
  })
  const motionKey = `${prompt}::${actionLabel}`

  React.useEffect(() => {
    setCanAnimateSwap(true)
  }, [])

  return (
    <div className={cn(className)} {...getAuthPageEnterItemProps()}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={motionKey}
          animate="visible"
          className="flex items-start justify-center gap-1 text-center"
          exit="exit"
          initial={canAnimateSwap ? "hidden" : false}
          variants={footerSwap}
          {...getAuthPageEnterItemProps()}
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
