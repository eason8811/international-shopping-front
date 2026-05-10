"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { motionTokens } from "@/lib/motion/tokens";
import { fadeSwap, staggerUp } from "@/lib/motion/recipes"
import { cn } from "@/lib/utils"

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
  const headerSwap = fadeSwap({
    reducedMotion,
    distance: motionTokens.distance.sm,
  })
  const headerChildren = staggerUp({
    reducedMotion,
    distance: motionTokens.distance.sm,
    stagger: motionTokens.stagger.regular,
  })
  const motionKey = `${title}::${description}`

  return (
    <header className={cn("flex w-full flex-col items-center gap-3 text-center", className)}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={motionKey}
          animate="visible"
          exit="exit"
          initial="hidden"
          variants={headerSwap}
        >
          <motion.div
            className="flex w-full flex-col items-center gap-3 text-center"
            variants={headerChildren.container}
          >
            <motion.h1
              className={[
                "font-serif text-(length:--type-heading-1-font-size) leading-(--type-heading-1-line-height)",
                "font-normal italic tracking-(--type-heading-1-letter-spacing) text-(--color-text-primary)",
              ].join(" ")}
              variants={headerChildren.item}
            >
              {title}
            </motion.h1>
            <motion.p
              className={[
                "max-w-104 font-sans text-(length:--type-paragraph-regular-font-size)",
                "leading-(--type-paragraph-regular-line-height) tracking-(--type-paragraph-regular-letter-spacing) text-(--color-text-secondary)",
              ].join(" ")}
              variants={headerChildren.item}
            >
              {description}
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </header>
  )
}
