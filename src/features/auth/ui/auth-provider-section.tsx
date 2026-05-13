"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"

import {
  AuthDivider,
  AuthFormFrame,
  AuthProviderButtons,
} from "@/components/auth/blocks"
import { fadeSwap } from "@/lib/motion/recipes"
import { motionTokens } from "@/lib/motion/tokens"
import { cn } from "@/lib/utils"

import { useAuthFlow, type AuthFlow } from "@/features/auth/model"

import { resolveAuthSubmitCopyTransition } from "./auth-motion"
import { getAuthPageEnterItemProps } from "./auth-stagger"

interface AuthProviderSectionProps {
  locale: string
  pageEnterReady: boolean
  returnTo?: string | null
  children: ReactNode
  className?: string
}

interface AuthProviderSectionContextValue {
  locale: string
  returnTo?: string | null
  flow: AuthFlow
  pageEnterReady: boolean
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
  const { flow, pageEnterReady, submitCopySwapEnabled } =
    useAuthProviderSectionContext()

  return {
    flow,
    pageEnterReady,
    submitCopySwapEnabled,
  }
}

function AuthProviderSectionRoot({
  locale,
  pageEnterReady,
  returnTo,
  children,
  className,
}: AuthProviderSectionProps) {
  const { meta } = useAuthFlow()
  const previousFlow = usePreviousFlow(meta.flow)
  const submitCopySwapEnabled =
    resolveAuthSubmitCopyTransition(previousFlow, meta.flow) === "copySlideSwap"

  return (
    <AuthProviderSectionContext.Provider
      value={{
        locale,
        returnTo,
        flow: meta.flow,
        pageEnterReady,
        submitCopySwapEnabled,
      }}
    >
      <section className={cn("flex w-full flex-col items-center gap-4", className)}>
        {children}
      </section>
    </AuthProviderSectionContext.Provider>
  )
}

function AuthProviderSectionProviders({
  className,
}: Pick<AuthProviderSectionSlotProps, "className">) {
  const { locale, returnTo } = useAuthProviderSectionContext()
  const t = useTranslations("AuthUi")

  return (
    <div className={cn("w-full", className)}>
      <AuthProviderButtons
        labels={{
          google: t("social.google"),
          tiktok: t("social.tiktok"),
          x: t("social.x"),
        }}
        locale={locale}
        returnTo={returnTo}
      />
    </div>
  )
}

function AuthProviderSectionDivider({
  className,
}: Pick<AuthProviderSectionSlotProps, "className">) {
  const t = useTranslations("AuthUi")

  return (
    <AuthDivider
      className={cn("w-full", className)}
      label={t("login.divider").toUpperCase()}
      {...getAuthPageEnterItemProps()}
    />
  )
}

function AuthProviderSectionForm({
  children,
  className,
}: AuthProviderSectionSlotProps) {
  const { flow, submitCopySwapEnabled } = useAuthProviderSectionMotion()
  const reducedMotion = useReducedMotion() ?? false
  const swapMotion = fadeSwap({
    reducedMotion,
    distance: motionTokens.distance.sm,
  })

  return (
    <div className={cn("w-full", className)}>
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
    </div>
  )
}

export const AuthProviderSection = Object.assign(AuthProviderSectionRoot, {
  Providers: AuthProviderSectionProviders,
  Divider: AuthProviderSectionDivider,
  Form: AuthProviderSectionForm,
})
