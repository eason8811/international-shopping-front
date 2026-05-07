import type { AuthFlow } from "@/features/auth/model"

import AuthPageClient from "./auth-page-client"

interface AuthPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const supportedFlows: AuthFlow[] = [
  "login",
  "login-email",
  "forgot-password",
  "reset-password",
  "reset-success",
  "register",
  "register-email",
  "verify-email",
  "register-success",
]

function readSingleValue(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function resolveInitialFlow(
  value: string | string[] | undefined
): AuthFlow {
  const rawFlow = readSingleValue(value)

  if (rawFlow && supportedFlows.includes(rawFlow as AuthFlow)) {
    return rawFlow as AuthFlow
  }

  return "login"
}

export default async function AuthPage({
  params,
  searchParams,
}: AuthPageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  return (
    <AuthPageClient
      initialFlow={resolveInitialFlow(resolvedSearchParams.flow)}
      locale={locale}
      oauthError={readSingleValue(resolvedSearchParams.oauth_error) ?? null}
      oauthSuccess={readSingleValue(resolvedSearchParams.oauth) === "success"}
      returnTo={readSingleValue(resolvedSearchParams.returnTo) ?? null}
    />
  )
}
