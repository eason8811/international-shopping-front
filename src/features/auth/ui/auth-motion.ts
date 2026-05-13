import type { AuthFlow } from "@/features/auth/model"

export function resolveAuthSubmitCopyTransition(
  previousFlow: AuthFlow | null | undefined,
  nextFlow: AuthFlow
) {
  const isLoginForgotPair =
    (previousFlow === "login-email" && nextFlow === "forgot-password") ||
    (previousFlow === "forgot-password" && nextFlow === "login-email")

  return isLoginForgotPair ? "copySlideSwap" : "none"
}
