"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import {
  AuthFooterLink,
  AuthHeroHeader,
} from "@/components/auth/blocks"
import { Navbar } from "@/components/shared/navbar"
import { PictureWithCard } from "@/components/shared/picture-with-card"
import {
  AuthFlowProvider,
  useAuthFlow,
  type AuthFlow,
  type AuthFooterKind,
  type AuthHeroFamily,
} from "@/features/auth/model"
import { AuthContent } from "@/features/auth/ui/auth-content"
import { AuthProviderSection } from "@/features/auth/ui/auth-provider-section"
import { AuthScreenLayout } from "@/features/auth/ui/auth-screen-layout"
import {
  ForgotPasswordPanel,
  LoginEmailPanel,
  LoginPanel,
  RegisterEmailPanel,
  RegisterPanel,
  RegisterSuccessPanel,
  ResetPasswordPanel,
  ResetSuccessPanel,
  VerifyEmailPanel,
} from "@/features/auth/ui/panels"

interface AuthPageClientProps {
  initialFlow: AuthFlow
  locale: string
  oauthError?: string | null
  oauthSuccess?: boolean
  returnTo?: string | null
}

function resolveHeroFamily(flow: AuthFlow): AuthHeroFamily {
  if (flow.startsWith("register")) {
    return "register"
  }

  if (flow.startsWith("forgot") || flow.startsWith("reset")) {
    return "recovery"
  }

  return "login"
}

function resolveFooterKind(flow: AuthFlow): AuthFooterKind | null {
  if (flow === "register-success" || flow === "reset-success") {
    return null
  }

  if (flow.startsWith("register") || flow === "verify-email") {
    return "register"
  }

  if (flow.startsWith("forgot") || flow.startsWith("reset")) {
    return "recovery"
  }

  return "login"
}

function AuthPageScene({
  locale,
  returnTo,
}: {
  locale: string
  returnTo?: string | null
}) {
  const t = useTranslations("AuthUi")
  const { actions, meta } = useAuthFlow()

  const heroFamily = resolveHeroFamily(meta.flow)
  const footerKind = resolveFooterKind(meta.flow)

  const heroTitle =
    heroFamily === "register"
      ? t("register.title")
      : heroFamily === "recovery"
        ? t("forgot.title")
        : t("login.title")

  const heroDescription =
    heroFamily === "register"
      ? t("register.subtitle")
      : heroFamily === "recovery"
        ? t("forgot.subtitle")
        : t("login.subtitle")

  const footer =
    footerKind === "login" ? (
      <AuthFooterLink
        actionLabel={t("login.footerAction")}
        prompt={t("login.footerPrompt")}
        onAction={() => actions.switchFlow("register")}
      />
    ) : footerKind === "register" ? (
      <AuthFooterLink
        actionLabel={t("register.footerAction")}
        prompt={t("register.footerPrompt")}
        onAction={() => actions.switchFlow("login")}
      />
    ) : footerKind === "recovery" ? (
      <AuthFooterLink
        actionLabel={t("forgot.footerAction")}
        prompt={t("forgot.footerPrompt")}
        onAction={() => actions.switchFlow("login-email")}
      />
    ) : undefined

  let panel: React.ReactNode
  switch (meta.flow) {
    case "login":
      panel = <LoginPanel />
      break
    case "login-email":
      panel = <LoginEmailPanel />
      break
    case "forgot-password":
      panel = <ForgotPasswordPanel />
      break
    case "reset-password":
      panel = <ResetPasswordPanel />
      break
    case "reset-success":
      panel = <ResetSuccessPanel />
      break
    case "register":
      panel = <RegisterPanel />
      break
    case "register-email":
      panel = <RegisterEmailPanel />
      break
    case "verify-email":
      panel = <VerifyEmailPanel />
      break
    case "register-success":
      panel = <RegisterSuccessPanel />
      break
  }

  return (
    <AuthScreenLayout
      navbar={
        <Navbar
          brandLabel={t("shell.brand")}
          cartLabel={t("shell.cartLabel")}
          menuLabel={t("shell.menuLabel")}
          nav={{
            collections: t("shell.nav.collections"),
            newArrivals: t("shell.nav.newArrivals"),
            support: t("shell.nav.support"),
          }}
          searchLabel={t("shell.searchLabel")}
          searchPlaceholder={t("shell.searchPlaceholder")}
        />
      }
      picture={
        <PictureWithCard
          author={t("layout.quoteAuthor")}
          quote={t("layout.quote")}
        />
      }
    >
      <AuthContent
        footer={footer}
        hero={<AuthHeroHeader description={heroDescription} title={heroTitle} />}
        section={
          <AuthProviderSection
            dividerLabel={t("login.divider").toUpperCase()}
            locale={locale}
            providerLabels={{
              google: t("social.google"),
              tiktok: t("social.tiktok"),
              x: t("social.x"),
            }}
            returnTo={returnTo}
          >
            {panel}
          </AuthProviderSection>
        }
      />
    </AuthScreenLayout>
  )
}

export default function AuthPageClient({
  initialFlow,
  locale,
  oauthError,
  oauthSuccess = false,
  returnTo,
}: AuthPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("AuthUi.success")

  React.useEffect(() => {
    if (!oauthError && !oauthSuccess) {
      return
    }

    if (oauthError) {
      toast.error(oauthError)
    }

    if (oauthSuccess) {
      toast.success(t("oauthTitle"), {
        description: t("oauthDescription"),
      })
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.delete("oauth")
    nextSearchParams.delete("oauth_error")

    const nextQuery = nextSearchParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    })
  }, [oauthError, oauthSuccess, pathname, router, searchParams, t])

  return (
    <AuthFlowProvider initialFlow={initialFlow} locale={locale} returnTo={returnTo}>
      <AuthPageScene locale={locale} returnTo={returnTo} />
    </AuthFlowProvider>
  )
}
