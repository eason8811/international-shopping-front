"use client"

import { ArrowRightIcon, CornerUpRightIcon, Loader2Icon, MailIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  AuthAccountField,
  AuthCodeResend,
  AuthEmailField,
  AuthOtpField,
  AuthPasswordField,
  AuthSuccessPanel,
  type AuthAccountFieldCopy,
  type AuthCodeResendCopy,
  type AuthEmailFieldEditableCopy,
  type AuthEmailFieldReadonlyCopy,
  type AuthOtpFieldCopy,
  type AuthPasswordFieldCopy,
  type AuthSuccessPanelCopy,
} from "@/components/auth/blocks"
import { Button } from "@/components/ui/button"

import { useAuthFlow } from "@/features/auth/model"

function usePasswordVisibility(field: string) {
  const { meta } = useAuthFlow()

  return Boolean(
    (meta.refs.passwordVisibility as Record<string, boolean> | undefined)?.[field]
  )
}

function useAuthPasswordToggleCopy(): Pick<
  AuthPasswordFieldCopy,
  "concealLabel" | "revealLabel"
> {
  const t = useTranslations("AuthUi")

  return {
    concealLabel: t("form.actions.hidePassword"),
    revealLabel: t("form.actions.showPassword"),
  }
}

function useAuthResendCopy(remainingSeconds: number): AuthCodeResendCopy {
  const t = useTranslations("AuthUi")

  return {
    actionLabel: t("form.resendAction"),
    countdownLabel: t("form.sentCountdown", {
      seconds: remainingSeconds,
    }),
    prompt: t("form.resendPrompt"),
  }
}

function useLoginEmailPanelCopy(): {
  accountFieldCopy: AuthAccountFieldCopy
  passwordFieldCopy: AuthPasswordFieldCopy
  submitLabel: string
} {
  const t = useTranslations("AuthUi")
  const passwordToggleCopy = useAuthPasswordToggleCopy()

  return {
    accountFieldCopy: {
      countryCodeLabel: t("form.labels.countryCode"),
      label: t("form.labels.account"),
      placeholder: t("form.placeholders.account"),
    },
    passwordFieldCopy: {
      ...passwordToggleCopy,
      label: t("form.labels.password"),
      placeholder: t("form.placeholders.password"),
      supportActionLabel: t("form.actions.forgotPassword"),
    },
    submitLabel: t("form.buttons.signIn"),
  }
}

function useRegisterEmailPanelCopy(): {
  emailFieldCopy: AuthEmailFieldEditableCopy
  passwordFieldCopy: AuthPasswordFieldCopy
  confirmPasswordFieldCopy: AuthPasswordFieldCopy
  submitLabel: string
} {
  const t = useTranslations("AuthUi")
  const passwordToggleCopy = useAuthPasswordToggleCopy()
  const passwordPlaceholder = t("form.placeholders.password")

  return {
    emailFieldCopy: {
      label: t("form.labels.email"),
      placeholder: t("form.placeholders.email"),
    },
    confirmPasswordFieldCopy: {
      ...passwordToggleCopy,
      label: t("form.labels.confirmPassword"),
      placeholder: passwordPlaceholder,
    },
    passwordFieldCopy: {
      ...passwordToggleCopy,
      label: t("form.labels.password"),
      placeholder: passwordPlaceholder,
    },
    submitLabel: t("form.buttons.signUp"),
  }
}

function useForgotPasswordPanelCopy(): {
  emailFieldCopy: AuthEmailFieldEditableCopy
  submitLabel: string
} {
  const t = useTranslations("AuthUi")

  return {
    emailFieldCopy: {
      label: t("form.labels.email"),
      placeholder: t("form.placeholders.email"),
    },
    submitLabel: t("form.buttons.sendCode"),
  }
}

function useVerifyEmailPanelCopy(remainingSeconds: number): {
  readonlyEmailCopy: AuthEmailFieldReadonlyCopy
  otpFieldCopy: AuthOtpFieldCopy
  resendCopy: AuthCodeResendCopy
  submitLabel: string
  fallbackEmail: string
} {
  const t = useTranslations("AuthUi")

  return {
    fallbackEmail: t("form.demoEmail"),
    otpFieldCopy: {
      ariaLabel: t("reset.codeLabel"),
    },
    readonlyEmailCopy: {
      helperLabel: t("form.labels.verificationSentTo"),
    },
    resendCopy: useAuthResendCopy(remainingSeconds),
    submitLabel: t("form.buttons.verify"),
  }
}

function useResetPasswordPanelCopy(remainingSeconds: number): {
  readonlyEmailCopy: AuthEmailFieldReadonlyCopy
  otpFieldCopy: AuthOtpFieldCopy
  resendCopy: AuthCodeResendCopy
  passwordFieldCopy: AuthPasswordFieldCopy
  confirmPasswordFieldCopy: AuthPasswordFieldCopy
  submitLabel: string
  fallbackEmail: string
} {
  const t = useTranslations("AuthUi")
  const passwordToggleCopy = useAuthPasswordToggleCopy()
  const passwordPlaceholder = t("form.placeholders.password")

  return {
    fallbackEmail: t("form.demoEmail"),
    confirmPasswordFieldCopy: {
      ...passwordToggleCopy,
      label: t("form.labels.confirmNewPassword"),
      placeholder: passwordPlaceholder,
    },
    otpFieldCopy: {
      ariaLabel: t("reset.codeLabel"),
    },
    passwordFieldCopy: {
      ...passwordToggleCopy,
      label: t("form.labels.newPassword"),
      placeholder: passwordPlaceholder,
    },
    readonlyEmailCopy: {
      helperLabel: t("form.labels.verificationSentTo"),
    },
    resendCopy: useAuthResendCopy(remainingSeconds),
    submitLabel: t("form.buttons.resetPassword"),
  }
}

function useRegisterSuccessPanelCopy(): AuthSuccessPanelCopy {
  const t = useTranslations("AuthUi")

  return {
    description: t("success.verifyDescription"),
    title: t("success.verifyTitle"),
  }
}

function useResetSuccessPanelCopy(): AuthSuccessPanelCopy {
  const t = useTranslations("AuthUi")

  return {
    description: t("success.resetDescription"),
    title: t("success.resetTitle"),
  }
}

function PendingIcon() {
  return <Loader2Icon className="animate-spin" data-icon="inline-end" />
}

export function LoginPanel() {
  const t = useTranslations("AuthUi")
  const { actions } = useAuthFlow()

  return (
    <Button
      className="w-full"
      size="large"
      type="button"
      variant="secondary"
      onClick={() => actions.switchFlow("login-email")}
    >
      <MailIcon data-icon="inline-start" />
      {t("login.continueWithEmail")}
    </Button>
  )
}

export function RegisterPanel() {
  const t = useTranslations("AuthUi")
  const { actions } = useAuthFlow()

  return (
    <Button
      className="w-full"
      size="large"
      type="button"
      variant="secondary"
      onClick={() => actions.switchFlow("register-email")}
    >
      <MailIcon data-icon="inline-start" />
      {t("register.continueWithEmail")}
    </Button>
  )
}

export function LoginEmailPanel() {
  const { actions, state } = useAuthFlow()
  const passwordVisible = usePasswordVisibility("loginPassword")
  const { accountFieldCopy, passwordFieldCopy, submitLabel } = useLoginEmailPanelCopy()

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-col gap-6">
        <AuthAccountField
          {...accountFieldCopy}
          autoComplete="username"
          countryCode={state.fields.loginCountryCode}
          error={state.errors.loginAccount}
          name="login-account"
          value={state.fields.loginAccount}
          onCountryCodeChange={(value) => actions.update("loginCountryCode", value)}
          onValueChange={(value) => actions.update("loginAccount", value)}
        />
        <AuthPasswordField
          {...passwordFieldCopy}
          autoComplete="current-password"
          error={state.errors.loginPassword}
          name="login-password"
          value={state.fields.loginPassword}
          visible={passwordVisible}
          onSupportAction={() => actions.switchFlow("forgot-password")}
          onToggleVisibility={() => actions.togglePasswordVisibility("loginPassword")}
          onValueChange={(value) => actions.update("loginPassword", value)}
        />
      </div>
      <Button
        className="w-full"
        data-pending={state.pending ? "true" : undefined}
        disabled={state.pending}
        size="large"
        type="button"
        variant="primary"
        onClick={() => void actions.submit()}
      >
        {submitLabel}
        {state.pending ? <PendingIcon /> : <ArrowRightIcon data-icon="inline-end" />}
      </Button>
    </div>
  )
}

export function RegisterEmailPanel() {
  const { actions, state } = useAuthFlow()
  const registerPasswordVisible = usePasswordVisibility("registerPassword")
  const confirmPasswordVisible = usePasswordVisibility("registerConfirmPassword")
  const {
    emailFieldCopy,
    confirmPasswordFieldCopy,
    passwordFieldCopy,
    submitLabel,
  } = useRegisterEmailPanelCopy()

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-col gap-6">
        <AuthEmailField
          {...emailFieldCopy}
          autoComplete="email"
          error={state.errors.registerAccount}
          name="register-account"
          value={state.fields.registerAccount}
          onValueChange={(value) => actions.update("registerAccount", value)}
        />
        <AuthPasswordField
          {...passwordFieldCopy}
          autoComplete="new-password"
          error={state.errors.registerPassword}
          name="register-password"
          value={state.fields.registerPassword}
          visible={registerPasswordVisible}
          onToggleVisibility={() => actions.togglePasswordVisibility("registerPassword")}
          onValueChange={(value) => actions.update("registerPassword", value)}
        />
        <AuthPasswordField
          {...confirmPasswordFieldCopy}
          autoComplete="new-password"
          error={state.errors.registerConfirmPassword}
          name="register-confirm-password"
          value={state.fields.registerConfirmPassword}
          visible={confirmPasswordVisible}
          onToggleVisibility={() =>
            actions.togglePasswordVisibility("registerConfirmPassword")
          }
          onValueChange={(value) =>
            actions.update("registerConfirmPassword", value)
          }
        />
      </div>
      <Button
        className="w-full"
        data-pending={state.pending ? "true" : undefined}
        disabled={state.pending}
        size="large"
        type="button"
        variant="primary"
        onClick={() => void actions.submit()}
      >
        {submitLabel}
        {state.pending ? <PendingIcon /> : <CornerUpRightIcon data-icon="inline-end" />}
      </Button>
    </div>
  )
}

export function ForgotPasswordPanel() {
  const { actions, state } = useAuthFlow()
  const { emailFieldCopy, submitLabel } = useForgotPasswordPanelCopy()

  return (
    <div className="flex w-full flex-col gap-8">
      <AuthEmailField
        {...emailFieldCopy}
        autoComplete="email"
        error={state.errors.forgotEmail}
        name="forgot-email"
        value={state.fields.forgotEmail}
        onValueChange={(value) => actions.update("forgotEmail", value)}
      />
      <Button
        className="w-full"
        data-pending={state.pending ? "true" : undefined}
        disabled={state.pending}
        size="large"
        type="button"
        variant="primary"
        onClick={() => void actions.submit()}
      >
        {submitLabel}
        {state.pending ? <PendingIcon /> : <ArrowRightIcon data-icon="inline-end" />}
      </Button>
    </div>
  )
}

export function VerifyEmailPanel() {
  const { actions, state } = useAuthFlow()
  const { fallbackEmail, otpFieldCopy, readonlyEmailCopy, resendCopy, submitLabel } =
    useVerifyEmailPanelCopy(state.resend.remainingSeconds)

  return (
    <div className="flex w-full flex-col gap-8">
      <AuthEmailField
        {...readonlyEmailCopy}
        mode="readonly"
        value={state.fields.verifyEmail || fallbackEmail}
      />
      <AuthOtpField
        {...otpFieldCopy}
        error={state.errors.verifyCode}
        value={state.fields.verifyCode}
        onValueChange={(value) => actions.update("verifyCode", value)}
      />
      <AuthCodeResend
        {...resendCopy}
        pending={state.pending}
        remainingSeconds={state.resend.remainingSeconds}
        onResend={() => void actions.resend()}
      />
      <Button
        className="w-full"
        data-pending={state.pending ? "true" : undefined}
        disabled={state.pending}
        size="large"
        type="button"
        variant="primary"
        onClick={() => void actions.submit()}
      >
        {submitLabel}
        {state.pending ? <PendingIcon /> : null}
      </Button>
    </div>
  )
}

export function ResetPasswordPanel() {
  const { actions, state } = useAuthFlow()
  const resetPasswordVisible = usePasswordVisibility("resetPassword")
  const resetConfirmVisible = usePasswordVisibility("resetConfirmPassword")
  const {
    fallbackEmail,
    confirmPasswordFieldCopy,
    otpFieldCopy,
    passwordFieldCopy,
    readonlyEmailCopy,
    resendCopy,
    submitLabel,
  } = useResetPasswordPanelCopy(state.resend.remainingSeconds)

  return (
    <div className="flex w-full flex-col gap-8">
      <AuthEmailField
        {...readonlyEmailCopy}
        mode="readonly"
        value={state.fields.resetEmail || fallbackEmail}
      />
      <AuthOtpField
        {...otpFieldCopy}
        error={state.errors.resetCode}
        value={state.fields.resetCode}
        onValueChange={(value) => actions.update("resetCode", value)}
      />
      <AuthCodeResend
        {...resendCopy}
        pending={state.pending}
        remainingSeconds={state.resend.remainingSeconds}
        onResend={() => void actions.resend()}
      />
      <div className="flex w-full flex-col gap-6">
        <AuthPasswordField
          {...passwordFieldCopy}
          autoComplete="new-password"
          error={state.errors.resetPassword}
          name="reset-password"
          value={state.fields.resetPassword}
          visible={resetPasswordVisible}
          onToggleVisibility={() => actions.togglePasswordVisibility("resetPassword")}
          onValueChange={(value) => actions.update("resetPassword", value)}
        />
        <AuthPasswordField
          {...confirmPasswordFieldCopy}
          autoComplete="new-password"
          error={state.errors.resetConfirmPassword}
          name="reset-confirm-password"
          value={state.fields.resetConfirmPassword}
          visible={resetConfirmVisible}
          onToggleVisibility={() =>
            actions.togglePasswordVisibility("resetConfirmPassword")
          }
          onValueChange={(value) =>
            actions.update("resetConfirmPassword", value)
          }
        />
      </div>
      <Button
        className="w-full"
        data-pending={state.pending ? "true" : undefined}
        disabled={state.pending}
        size="large"
        type="button"
        variant="primary"
        onClick={() => void actions.submit()}
      >
        {submitLabel}
        {state.pending ? <PendingIcon /> : <ArrowRightIcon data-icon="inline-end" />}
      </Button>
    </div>
  )
}

export function RegisterSuccessPanel() {
  const registerSuccessCopy = useRegisterSuccessPanelCopy()
  const { state } = useAuthFlow()

  return (
    <AuthSuccessPanel
      {...registerSuccessCopy}
      description={state.success.description ?? registerSuccessCopy.description}
      title={state.success.title ?? registerSuccessCopy.title}
    />
  )
}

export function ResetSuccessPanel() {
  const resetSuccessCopy = useResetSuccessPanelCopy()
  const { state } = useAuthFlow()

  return (
    <AuthSuccessPanel
      {...resetSuccessCopy}
      description={state.success.description ?? resetSuccessCopy.description}
      title={state.success.title ?? resetSuccessCopy.title}
    />
  )
}
