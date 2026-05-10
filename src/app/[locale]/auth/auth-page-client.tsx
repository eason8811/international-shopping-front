"use client"

import * as React from "react"
import { motionTokens } from "@/lib/motion/tokens";
import { motion, useReducedMotion } from "motion/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import {
  AuthFooterLink,
  AuthHeroHeader,
  type AuthFooterLinkCopy,
  type AuthHeroHeaderCopy,
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
import { staggerUp } from "@/lib/motion/recipes"

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

function resolveFooterTargetFlow(flow: AuthFlow): AuthFlow | null {
  const footerKind = resolveFooterKind(flow)

  if (footerKind === "login")
    return "register"

  if (footerKind === "register")
    return "login"

  if (footerKind === "recovery")
    return "login-email"

  return null
}

function useAuthHeroCopy(flow: AuthFlow): AuthHeroHeaderCopy {
  const t = useTranslations("AuthUi")
  const heroFamily = resolveHeroFamily(flow)

  if (heroFamily === "register")
    return {
      description: t("register.subtitle"),
      title: t("register.title"),
    }

  if (heroFamily === "recovery")
    return {
      description: t("forgot.subtitle"),
      title: t("forgot.title"),
    }

  return {
    description: t("login.subtitle"),
    title: t("login.title"),
  }
}

function useAuthFooterCopy(flow: AuthFlow): AuthFooterLinkCopy | null {
  const t = useTranslations("AuthUi")
  const footerKind = resolveFooterKind(flow)

  if (footerKind === "login")
    return {
      actionLabel: t("login.footerAction"),
      prompt: t("login.footerPrompt"),
    }

  if (footerKind === "register")
    return {
      actionLabel: t("register.footerAction"),
      prompt: t("register.footerPrompt"),
    }

  if (footerKind === "recovery")
    return {
      actionLabel: t("forgot.footerAction"),
      prompt: t("forgot.footerPrompt"),
    }

  return null
}

function AuthPageScene({
  locale,
  returnTo,
}: {
  locale: string
  returnTo?: string | null
}) {
  const { actions, meta } = useAuthFlow()
  const reducedMotion = useReducedMotion() ?? false
  const frame5Motion = staggerUp({
    reducedMotion,
    distance: motionTokens.distance.md,
    stagger: motionTokens.stagger.regular,
  })
  const heroCopy = useAuthHeroCopy(meta.flow)
  const footerCopy = useAuthFooterCopy(meta.flow)
  const footerTargetFlow = resolveFooterTargetFlow(meta.flow)

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
    <AuthScreenLayout>
      <AuthScreenLayout.Navbar>
        <Navbar />
      </AuthScreenLayout.Navbar>

      <AuthScreenLayout.Main>
        <motion.div
          animate="visible"
          className="contents"
          initial="hidden"
          variants={frame5Motion.container}
        >
          <AuthScreenLayout.Content>
            <AuthContent>
              <AuthContent.Hero>
                <motion.div variants={frame5Motion.item}>
                  <AuthHeroHeader {...heroCopy} />
                </motion.div>
              </AuthContent.Hero>

              <AuthContent.Section>
                <motion.div variants={frame5Motion.item}>
                  <AuthProviderSection locale={locale} returnTo={returnTo}>
                    <AuthProviderSection.Providers />
                    <AuthProviderSection.Divider />
                    <AuthProviderSection.Form>{panel}</AuthProviderSection.Form>
                  </AuthProviderSection>
                </motion.div>
              </AuthContent.Section>

              {footerCopy && footerTargetFlow ? (
                <AuthContent.Footer>
                  <motion.div variants={frame5Motion.item}>
                    <AuthFooterLink
                      {...footerCopy}
                      onAction={() => actions.switchFlow(footerTargetFlow)}
                    />
                  </motion.div>
                </AuthContent.Footer>
              ) : null}
            </AuthContent>
          </AuthScreenLayout.Content>

          <AuthScreenLayout.Picture>
            <motion.div className="h-full w-full" variants={frame5Motion.item}>
              <PictureWithCard />
            </motion.div>
          </AuthScreenLayout.Picture>
        </motion.div>
      </AuthScreenLayout.Main>
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
