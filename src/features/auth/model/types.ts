export type AuthFlow =
  | "login"
  | "login-email"
  | "forgot-password"
  | "reset-password"
  | "reset-success"
  | "register"
  | "register-email"
  | "verify-email"
  | "register-success"

export type AuthHeroFamily = "login" | "register" | "recovery"
export type AuthFooterKind = "login" | "register" | "recovery"
export type AuthSubmitStatus = "idle" | "loading" | "success"

export type AuthFieldName =
  | "loginAccount"
  | "loginCountryCode"
  | "loginPassword"
  | "registerAccount"
  | "registerPassword"
  | "registerConfirmPassword"
  | "forgotEmail"
  | "verifyEmail"
  | "verifyCode"
  | "resetEmail"
  | "resetCode"
  | "resetPassword"
  | "resetConfirmPassword"

export interface AuthFlowContextValue {
  state: {
    fields: Record<string, string>
    errors: Record<string, string | null>
    pending: boolean
    submitStatus: AuthSubmitStatus
    resend: {
      status: "idle" | "countdown" | "success"
      remainingSeconds: number
    }
    success: {
      visible: boolean
      title: string | null
      description: string | null
    }
  }
  actions: {
    update: (name: string, value: string) => void
    submit: () => Promise<void>
    resend: () => Promise<void>
    togglePasswordVisibility: (field: string) => void
    switchFlow: (flow: AuthFlow) => void
  }
  meta: {
    flow: AuthFlow
    device: "desktop" | "mobile"
    refs: Record<string, unknown>
  }
}
