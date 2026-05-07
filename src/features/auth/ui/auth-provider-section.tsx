import type { ReactNode } from "react"

import {
  AuthDivider,
  AuthFormFrame,
  AuthProviderButtons,
} from "@/components/auth/blocks"
import { cn } from "@/lib/utils"

interface AuthProviderSectionProps {
  locale: string
  returnTo?: string | null
  dividerLabel: string
  providerLabels: {
    google: string
    tiktok: string
    x: string
  }
  children: ReactNode
  className?: string
}

export function AuthProviderSection({
  locale,
  returnTo,
  dividerLabel,
  providerLabels,
  children,
  className,
}: AuthProviderSectionProps) {
  return (
    <section className={cn("flex w-full flex-col items-center gap-4", className)}>
      <AuthProviderButtons
        labels={providerLabels}
        locale={locale}
        returnTo={returnTo}
      />
      <AuthDivider label={dividerLabel} />
      <AuthFormFrame>{children}</AuthFormFrame>
    </section>
  )
}
