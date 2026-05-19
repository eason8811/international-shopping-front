"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { motion, useReducedMotion, useAnimationControls } from "motion/react"
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
  const controls = useAnimationControls()
  const outerRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const hasLockedHeightRef = React.useRef(false)
  const lastHeightRef = React.useRef<number | null>(null)
  const heightTransition = autoHeightTransition({ reducedMotion })

  const updateHeight = React.useCallback(
    () => {
      const content = contentRef.current

      if (!content)
        return

      const nextHeight = Math.ceil(content.offsetHeight)

      if (lastHeightRef.current === nextHeight)
        return

      /**
       * 关键:
       * 第一次不要 start, 而是 set
       * 目的不是播放动画, 而是把 DOM 真实锁在初始高度
       */
      if (!hasLockedHeightRef.current) {
        hasLockedHeightRef.current = true
        lastHeightRef.current = nextHeight

        controls.set({ height: nextHeight })
        return
      }

      lastHeightRef.current = nextHeight

      controls.start({
        height: nextHeight,
        transition: heightTransition,
      }).then(() => {})
    },
    [controls, heightTransition]
  )

  React.useLayoutEffect(() => {
    if (reducedMotion)
      return

    const content = contentRef.current

    if (!content)
      return

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
  }, [reducedMotion, updateHeight])

  React.useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    /**
     * children 变化时主动测一次。
     * 注意：不要在这里重置 hasLockedHeightRef。
     */
    updateHeight()
  }, [children, reducedMotion, updateHeight])

  if (reducedMotion) {
    return (
      <div className={cn("w-full", className)}>
        <AuthFormFrame>{children}</AuthFormFrame>
      </div>
    )
  }

  return (
    <motion.div
      ref={outerRef}
      animate={controls}
      className={cn("w-full overflow-visual", className)}
      initial={false}
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
