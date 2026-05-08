"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { useTranslations } from "next-intl"

import {
  AuthDivider,
  AuthFormFrame,
  AuthProviderButtons,
} from "@/components/auth/blocks"
import { cn } from "@/lib/utils"

interface AuthProviderSectionProps {
  locale: string
  returnTo?: string | null
  children: ReactNode
  className?: string
}

interface AuthProviderSectionContextValue {
  locale: string
  returnTo?: string | null
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

function AuthProviderSectionRoot({
  locale,
  returnTo,
  children,
  className,
}: AuthProviderSectionProps) {
  return (
    <AuthProviderSectionContext.Provider value={{ locale, returnTo }}>
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
    <AuthProviderButtons
      className={className}
      labels={{
        google: t("social.google"),
        tiktok: t("social.tiktok"),
        x: t("social.x"),
      }}
      locale={locale}
      returnTo={returnTo}
    />
  )
}

function AuthProviderSectionDivider({
  className,
}: Pick<AuthProviderSectionSlotProps, "className">) {
  const t = useTranslations("AuthUi")

  return <AuthDivider className={className} label={t("login.divider").toUpperCase()} />
}

function AuthProviderSectionForm({
  children,
  className,
}: AuthProviderSectionSlotProps) {
  return <AuthFormFrame className={className}>{children}</AuthFormFrame>
}

export const AuthProviderSection = Object.assign(AuthProviderSectionRoot, {
  Providers: AuthProviderSectionProviders,
  Divider: AuthProviderSectionDivider,
  Form: AuthProviderSectionForm,
})
