import type { AuthFlow } from "@/features/auth/model"

export const authFrame5Items = [
  "hero",
  "provider-section",
  "footer",
  "picture",
] as const

export type AuthFrame5Item = (typeof authFrame5Items)[number]

export type AuthHeroMotionKey = "login" | "register" | "recovery"
export type AuthFooterMotionKey = "login" | "register" | "recovery" | null
export type AuthFormEnterPattern =
  | "button-only"
  | "direct-children"
  | "input-group-children-and-button"
  | "reset-static-group-with-inner-stagger"
  | "success-panel"

export interface AuthFormMotionConfig {
  enterPattern: AuthFormEnterPattern
  successCopyMotion: "staggerUp" | null
  successIconMotion: "successSpring" | null
}

export function resolveAuthHeroMotionKey(flow: AuthFlow): AuthHeroMotionKey {
  if (flow.startsWith("register") || flow === "verify-email")
    return "register"

  if (flow.startsWith("forgot") || flow.startsWith("reset"))
    return "recovery"

  return "login"
}

export function resolveAuthFooterMotionKey(flow: AuthFlow): AuthFooterMotionKey {
  if (flow === "register-success" || flow === "reset-success")
    return null

  if (flow.startsWith("register") || flow === "verify-email")
    return "register"

  if (flow.startsWith("forgot") || flow.startsWith("reset"))
    return "recovery"

  return "login"
}

export function resolveAuthHeroTransition(
  previousFlow: AuthFlow | null | undefined,
  nextFlow: AuthFlow
) {
  if (!previousFlow)
    return "fadeSwap"

  return resolveAuthHeroMotionKey(previousFlow) === resolveAuthHeroMotionKey(nextFlow)
    ? "none"
    : "fadeSwap"
}

export function resolveAuthFooterTransition(
  previousFlow: AuthFlow | null | undefined,
  nextFlow: AuthFlow
) {
  const previousKey = previousFlow
    ? resolveAuthFooterMotionKey(previousFlow)
    : null
  const nextKey = resolveAuthFooterMotionKey(nextFlow)

  if (!nextKey)
    return "none"

  if (!previousFlow)
    return "fadeSwap"

  return previousKey === nextKey ? "none" : "fadeSwap"
}

export function resolveAuthSubmitCopyTransition(
  previousFlow: AuthFlow | null | undefined,
  nextFlow: AuthFlow
) {
  const isLoginForgotPair =
    (previousFlow === "login-email" && nextFlow === "forgot-password") ||
    (previousFlow === "forgot-password" && nextFlow === "login-email")

  return isLoginForgotPair ? "copySlideSwap" : "none"
}

export function resolveAuthSuccessTransition(
  previousFlow: AuthFlow | null | undefined,
  nextFlow: AuthFlow
) {
  const isRegisterSuccessTransition =
    previousFlow === "verify-email" && nextFlow === "register-success"
  const isResetSuccessTransition =
    previousFlow === "reset-password" && nextFlow === "reset-success"

  if (isRegisterSuccessTransition || isResetSuccessTransition) {
    return {
      copy: "staggerUp" as const,
      icon: "successSpring" as const,
    }
  }

  return {
    copy: null,
    icon: null,
  }
}

export function resolveAuthFormMotion(flow: AuthFlow): AuthFormMotionConfig {
  if (flow === "login")
    return {
      enterPattern: "button-only",
      successCopyMotion: null,
      successIconMotion: null,
    }

  if (flow === "login-email")
    return {
      enterPattern: "input-group-children-and-button",
      successCopyMotion: null,
      successIconMotion: null,
    }

  if (flow === "forgot-password" || flow === "verify-email")
    return {
      enterPattern: "direct-children",
      successCopyMotion: null,
      successIconMotion: null,
    }

  if (flow === "reset-password")
    return {
      enterPattern: "reset-static-group-with-inner-stagger",
      successCopyMotion: null,
      successIconMotion: null,
    }

  if (flow === "register")
    return {
      enterPattern: "button-only",
      successCopyMotion: null,
      successIconMotion: null,
    }

  if (flow === "register-email")
    return {
      enterPattern: "input-group-children-and-button",
      successCopyMotion: null,
      successIconMotion: null,
    }

  return {
    enterPattern: "success-panel",
    successCopyMotion: "staggerUp",
    successIconMotion: "successSpring",
  }
}
