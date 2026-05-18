"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"

import {
  AuthDivider,
  AuthFormFrame,
  AuthProviderButtons,
} from "@/components/auth/blocks"
import { autoHeightTransition } from "@/lib/motion/recipes"
import { cn } from "@/lib/utils"
import { getAuthPageEnterItemProps } from "./auth-stagger"

interface AuthProviderSectionProps {
  locale: string
  pageEnterReady: boolean
  suppressFormEnterStagger?: boolean
  returnTo?: string | null
  children: ReactNode
  className?: string
}

interface AuthProviderSectionContextValue {
  locale: string
  returnTo?: string | null
  pageEnterReady: boolean
  suppressFormEnterStagger: boolean
}

interface AuthProviderSectionSlotProps {
  children?: ReactNode
  className?: string
}

const AuthProviderSectionContext =
  React.createContext<AuthProviderSectionContextValue | null>(null)

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
  const { pageEnterReady, suppressFormEnterStagger } = useAuthProviderSectionContext()

  return {
    pageEnterReady,
    suppressFormEnterStagger,
  }
}

function AuthProviderSectionRoot({
  locale,
  pageEnterReady,
  suppressFormEnterStagger = false,
  returnTo,
  children,
  className,
}: AuthProviderSectionProps) {
  return (
    <AuthProviderSectionContext.Provider
      value={{
        locale,
        returnTo,
        pageEnterReady,
        suppressFormEnterStagger,
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
  const reducedMotion = useReducedMotion() ?? false
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = React.useState<number | null>(null)
  const heightTransition = autoHeightTransition({ reducedMotion })

  React.useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const content = contentRef.current

    if (!content)
      return

    const updateHeight = () =>
      setHeight(content.scrollHeight)

    updateHeight()

    if (typeof ResizeObserver === "undefined")
      return

    const observer = new ResizeObserver(() => {
      updateHeight()
    })

    observer.observe(content)

    return () => {
      observer.disconnect()
    }
  }, [children, reducedMotion])

  if (reducedMotion) {
    return (
      <div className={cn("w-full", className)}>
        <AuthFormFrame>{children}</AuthFormFrame>
      </div>
    )
  }

  return (
    <motion.div
      animate={height === null ? undefined : { height }}
      className={cn("w-full overflow-visible overflow-hidden", className)}
      initial={false}
      transition={heightTransition}
    >
      <div ref={contentRef}>
        <AuthFormFrame>{children}</AuthFormFrame>
      </div>
    </motion.div>
  )
}

export const AuthProviderSection = Object.assign(AuthProviderSectionRoot, {
  Providers: AuthProviderSectionProviders,
  Divider: AuthProviderSectionDivider,
  Form: AuthProviderSectionForm,
})
