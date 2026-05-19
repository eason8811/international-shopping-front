"use client"

import { CheckIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import {delayStaggerUp, successSpring} from "@/lib/motion/recipes"
import { cn } from "@/lib/utils"

export interface AuthSuccessPanelCopy {
  title: string
  description: string
}

interface AuthSuccessPanelProps extends AuthSuccessPanelCopy {
  className?: string
}

export function AuthSuccessPanel({
  title,
  description,
  className,
}: AuthSuccessPanelProps) {
  const reducedMotion = useReducedMotion() ?? false
  const copyMotion = delayStaggerUp({ reducedMotion })
  const iconMotion = successSpring({ reducedMotion })

  return (
    <div className={cn("flex w-full flex-col items-center gap-6 py-8", className)}>
      <motion.div
        animate="visible"
        className="relative flex size-16 items-center justify-center"
        initial="hidden"
        variants={iconMotion}
      >
        <span className="absolute inset-0 rounded-full bg-(--color-surface-success) opacity-25" />
        <span className="absolute inset-3 rounded-full bg-(--color-surface-success)" />
        <CheckIcon
          aria-hidden="true"
          className="relative z-10 size-6 text-(--color-text-inverse)"
        />
      </motion.div>
      <motion.div
        animate="visible"
        className="flex w-full flex-col items-center gap-2 text-center"
        initial="hidden"
        variants={copyMotion.container}
      >
        <motion.h2
          className={[
            "font-sans text-(length:--type-paragraph-xl-font-size) font-semibold",
            "leading-(--type-paragraph-xl-line-height) tracking-(--type-paragraph-xl-letter-spacing) text-(--color-text-primary)",
          ].join(" ")}
          variants={copyMotion.item}
        >
          {title}
        </motion.h2>
        <motion.p
          className={[
            "max-w-sm font-sans text-(length:--type-paragraph-small-font-size)",
            "leading-(--type-paragraph-small-line-height) tracking-(--type-paragraph-small-letter-spacing) text-(--color-text-secondary)",
          ].join(" ")}
          variants={copyMotion.item}
        >
          {description}
        </motion.p>
      </motion.div>
    </div>
  )
}
