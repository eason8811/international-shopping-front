import type { AuthFlow, AuthSceneTransition } from "./types"

export function resolveAuthSceneTransition(
  previousFlow: AuthFlow | null | undefined,
  nextFlow: AuthFlow
): AuthSceneTransition {
  const isTopLevelLoginRegisterPair = (nextFlow === "login" &&
    (previousFlow === "register" || previousFlow === "register-email" || previousFlow === "verify-email")) ||
    (nextFlow === "register" && (previousFlow === "login" || previousFlow === "login-email"))


  const isLoginForgotPair =
    (previousFlow === "login-email" && nextFlow === "forgot-password") ||
    (previousFlow === "forgot-password" && nextFlow === "login-email")

  return {
    replayPageStagger: isTopLevelLoginRegisterPair,
    suppressFormEnterStagger: isTopLevelLoginRegisterPair,
    swapHeroFooter: isLoginForgotPair,
  }
}
