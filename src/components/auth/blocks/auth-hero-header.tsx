"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { fadeSwap } from "@/lib/motion/recipes"
import { motionTokens } from "@/lib/motion/tokens"
import { cn } from "@/lib/utils"
import { getAuthPageEnterItemProps } from "@/features/auth/ui/auth-stagger"

export interface AuthHeroHeaderCopy {
  title: string
  description: string
}

interface AuthHeroHeaderProps extends AuthHeroHeaderCopy {
  className?: string
}

export function AuthHeroHeader({
  title,
  description,
  className,
}: AuthHeroHeaderProps) {
  const reducedMotion = useReducedMotion() ?? false
  const [canAnimateSwap, setCanAnimateSwap] = React.useState(false)
  const headerSwap = fadeSwap({
    reducedMotion,
    distance: motionTokens.distance.sm,
  })
  const motionKey = `${title}::${description}`

  React.useEffect(() => {
    setCanAnimateSwap(true)
  }, [])

  return (
    <header className={cn("flex w-full flex-col items-center gap-3 text-center", className)}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={motionKey}
          animate="visible"
          exit="exit"
          initial={canAnimateSwap ? "hidden" : false}
          variants={headerSwap}
        >
          <div className="flex w-full flex-col items-center gap-3 text-center">
            <h1
              className={[
                "font-serif text-(length:--type-heading-1-font-size) leading-(--type-heading-1-line-height)",
                "font-normal italic tracking-(--type-heading-1-letter-spacing) text-(--color-text-primary)",
              ].join(" ")}
              {...getAuthPageEnterItemProps()}
            >
              {title}
            </h1>
            <p
              className={[
                "max-w-104 font-sans text-(length:--type-paragraph-regular-font-size)",
                "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing) text-(--color-text-secondary)",
              ].join(" ")}
              {...getAuthPageEnterItemProps()}
            >
              {description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </header>
  )
}
