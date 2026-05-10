"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { motionTokens } from "@/lib/motion/tokens";
import { useTranslations } from "next-intl"

import {
  AuthDivider,
  AuthFormFrame,
  AuthProviderButtons,
} from "@/components/auth/blocks"
import { fadeSwap, staggerUp } from "@/lib/motion/recipes"
import { cn } from "@/lib/utils"

import { useAuthFlow, type AuthFlow } from "@/features/auth/model"

import { resolveAuthSubmitCopyTransition } from "./auth-motion"

interface AuthProviderSectionProps {
  locale: string
  returnTo?: string | null
  children: ReactNode
  className?: string
}

interface AuthProviderSectionContextValue {
  locale: string
  returnTo?: string | null
  flow: AuthFlow
  submitCopySwapEnabled: boolean
}

interface AuthProviderSectionSlotProps {
  children?: ReactNode
  className?: string
}

const AuthProviderSectionContext =
  React.createContext<AuthProviderSectionContextValue | null>(null)

function usePreviousFlow(flow: AuthFlow) {
  const [history, setHistory] = React.useState<{
    current: AuthFlow
    previous: AuthFlow | null
  }>({
    current: flow,
    previous: null,
  })

  React.useEffect(() => {
    setHistory((currentHistory) =>
      currentHistory.current === flow
        ? currentHistory
        : {
            current: flow,
            previous: currentHistory.current,
          }
    )
  }, [flow])

  return history.current === flow ? history.previous : history.current
}

function useAuthProviderSectionContext() {
  const context = React.useContext(AuthProviderSectionContext)

  if (!context) {
    throw new Error(
      "AuthProviderSection compound components must be used within AuthProviderSection."
    )
  }

  return context
}

export function useAuthProviderSectionMotion() {
  const { flow, submitCopySwapEnabled } = useAuthProviderSectionContext()

  return {
    flow,
    submitCopySwapEnabled,
  }
}

function AuthProviderSectionRoot({
  locale,
  returnTo,
  children,
  className,
}: AuthProviderSectionProps) {
  const reducedMotion = useReducedMotion() ?? false
  const { meta } = useAuthFlow()
  const previousFlow = usePreviousFlow(meta.flow)
  const directChildMotion = staggerUp({
    reducedMotion,
    distance: motionTokens.distance.sm,
    stagger: motionTokens.stagger.regular,
  })
  const submitCopySwapEnabled =
    resolveAuthSubmitCopyTransition(previousFlow, meta.flow) === "copySlideSwap"

  return (
    <AuthProviderSectionContext.Provider
      value={{
        locale,
        returnTo,
        flow: meta.flow,
        submitCopySwapEnabled,
      }}
    >
      <motion.section
        animate="visible"
        className={cn("flex w-full flex-col items-center gap-4", className)}
        initial="hidden"
        variants={directChildMotion.container}
      >
        {children}
      </motion.section>
    </AuthProviderSectionContext.Provider>
  )
}

function AuthProviderSectionProviders({
  className,
}: Pick<AuthProviderSectionSlotProps, "className">) {
  const { locale, returnTo } = useAuthProviderSectionContext()
  const t = useTranslations("AuthUi")
  const reducedMotion = useReducedMotion() ?? false
  const directChildMotion = staggerUp({
    reducedMotion,
    distance: motionTokens.distance.sm,
    stagger: motionTokens.stagger.regular,
  })

  return (
    <motion.div className={cn("w-full", className)} variants={directChildMotion.item}>
      <AuthProviderButtons
        labels={{
          google: t("social.google"),
          tiktok: t("social.tiktok"),
          x: t("social.x"),
        }}
        locale={locale}
        returnTo={returnTo}
      />
    </motion.div>
  )
}

function AuthProviderSectionDivider({
  className,
}: Pick<AuthProviderSectionSlotProps, "className">) {
  const t = useTranslations("AuthUi")
  const reducedMotion = useReducedMotion() ?? false
  const directChildMotion = staggerUp({
    reducedMotion,
    distance: motionTokens.distance.sm,
    stagger: motionTokens.stagger.regular,
  })

  return (
    <motion.div className={cn("w-full", className)} variants={directChildMotion.item}>
      <AuthDivider label={t("login.divider").toUpperCase()} />
    </motion.div>
  )
}

function AuthProviderSectionForm({
  children,
  className,
}: AuthProviderSectionSlotProps) {
  const { flow, submitCopySwapEnabled } = useAuthProviderSectionMotion()
  const reducedMotion = useReducedMotion() ?? false
  const directChildMotion = staggerUp({
    reducedMotion,
    distance: motionTokens.distance.sm,
    stagger: motionTokens.stagger.regular,
  })
  const swapMotion = fadeSwap({
    reducedMotion,
    distance: 8,
  })

  return (
    <motion.div className={cn("w-full", className)} variants={directChildMotion.item}>
      <AuthFormFrame>
        {submitCopySwapEnabled ? (
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={flow}
              animate="visible"
              className="contents"
              exit="exit"
              initial="hidden"
              variants={swapMotion}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        ) : (
          children
        )}
      </AuthFormFrame>
    </motion.div>
  )
}

export const AuthProviderSection = Object.assign(AuthProviderSectionRoot, {
  Providers: AuthProviderSectionProviders,
  Divider: AuthProviderSectionDivider,
  Form: AuthProviderSectionForm,
})
