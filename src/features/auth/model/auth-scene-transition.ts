import type { AuthFlow, AuthSceneTransition } from "./types"

export function resolveAuthSceneTransition(
  previousFlow: AuthFlow | null | undefined,
  nextFlow: AuthFlow
): AuthSceneTransition {
  const isTopLevelLoginRegisterPair =
    (previousFlow === "login" && nextFlow === "register") ||
    (previousFlow === "register" && nextFlow === "login")

  const isLoginForgotPair =
    (previousFlow === "login-email" && nextFlow === "forgot-password") ||
    (previousFlow === "forgot-password" && nextFlow === "login-email")

  return {
    replayPageStagger: isTopLevelLoginRegisterPair,
    suppressFormEnterStagger: isTopLevelLoginRegisterPair,
    swapHeroFooter: isLoginForgotPair,
  }
}
