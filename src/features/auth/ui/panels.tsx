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
} from "@/components/auth/blocks"
import { Button } from "@/components/ui/button"

import { useAuthFlow } from "@/features/auth/model"

function usePasswordVisibility(field: string) {
  const { meta } = useAuthFlow()

  return Boolean(
    (meta.refs.passwordVisibility as Record<string, boolean> | undefined)?.[field]
  )
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
  const t = useTranslations("AuthUi")
  const { actions, state } = useAuthFlow()
  const passwordVisible = usePasswordVisibility("loginPassword")

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-col gap-6">
        <AuthAccountField
          autoComplete="username"
          error={state.errors.loginAccount}
          label={t("form.labels.account")}
          name="login-account"
          placeholder={t("form.placeholders.account")}
          value={state.fields.loginAccount}
          onValueChange={(value) => actions.update("loginAccount", value)}
        />
        <AuthPasswordField
          autoComplete="current-password"
          concealLabel={t("form.actions.hidePassword")}
          error={state.errors.loginPassword}
          label={t("form.labels.password")}
          name="login-password"
          placeholder={t("form.placeholders.password")}
          revealLabel={t("form.actions.showPassword")}
          supportActionLabel={t("form.actions.forgotPassword")}
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
        {t("form.buttons.signIn")}
        {state.pending ? <PendingIcon /> : <ArrowRightIcon data-icon="inline-end" />}
      </Button>
    </div>
  )
}

export function RegisterEmailPanel() {
  const t = useTranslations("AuthUi")
  const { actions, state } = useAuthFlow()
  const registerPasswordVisible = usePasswordVisibility("registerPassword")
  const confirmPasswordVisible = usePasswordVisibility("registerConfirmPassword")

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-col gap-6">
        <AuthAccountField
          autoComplete="email"
          error={state.errors.registerAccount}
          inputMode="email"
          label={t("form.labels.account")}
          name="register-account"
          placeholder={t("form.placeholders.account")}
          value={state.fields.registerAccount}
          onValueChange={(value) => actions.update("registerAccount", value)}
        />
        <AuthPasswordField
          autoComplete="new-password"
          concealLabel={t("form.actions.hidePassword")}
          error={state.errors.registerPassword}
          label={t("form.labels.password")}
          name="register-password"
          placeholder={t("form.placeholders.password")}
          revealLabel={t("form.actions.showPassword")}
          value={state.fields.registerPassword}
          visible={registerPasswordVisible}
          onToggleVisibility={() => actions.togglePasswordVisibility("registerPassword")}
          onValueChange={(value) => actions.update("registerPassword", value)}
        />
        <AuthPasswordField
          autoComplete="new-password"
          concealLabel={t("form.actions.hidePassword")}
          error={state.errors.registerConfirmPassword}
          label={t("form.labels.confirmPassword")}
          name="register-confirm-password"
          placeholder={t("form.placeholders.password")}
          revealLabel={t("form.actions.showPassword")}
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
        {t("form.buttons.signUp")}
        {state.pending ? <PendingIcon /> : <CornerUpRightIcon data-icon="inline-end" />}
      </Button>
    </div>
  )
}

export function ForgotPasswordPanel() {
  const t = useTranslations("AuthUi")
  const { actions, state } = useAuthFlow()

  return (
    <div className="flex w-full flex-col gap-8">
      <AuthEmailField
        autoComplete="email"
        error={state.errors.forgotEmail}
        label={t("form.labels.email")}
        name="forgot-email"
        placeholder={t("form.placeholders.email")}
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
        {t("form.buttons.sendCode")}
        {state.pending ? <PendingIcon /> : <ArrowRightIcon data-icon="inline-end" />}
      </Button>
    </div>
  )
}

export function VerifyEmailPanel() {
  const t = useTranslations("AuthUi")
  const { actions, state } = useAuthFlow()

  return (
    <div className="flex w-full flex-col gap-8">
      <AuthEmailField
        helperLabel={t("form.labels.verificationSentTo")}
        mode="readonly"
        value={state.fields.verifyEmail || t("form.demoEmail")}
      />
      <AuthOtpField
        ariaLabel={t("reset.codeLabel")}
        error={state.errors.verifyCode}
        value={state.fields.verifyCode}
        onValueChange={(value) => actions.update("verifyCode", value)}
      />
      <AuthCodeResend
        actionLabel={t("form.resendAction")}
        countdownLabel={t("form.sentCountdown", {
          seconds: state.resend.remainingSeconds,
        })}
        pending={state.pending}
        prompt={t("form.resendPrompt")}
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
        {t("form.buttons.verify")}
        {state.pending ? <PendingIcon /> : null}
      </Button>
    </div>
  )
}

export function ResetPasswordPanel() {
  const t = useTranslations("AuthUi")
  const { actions, state } = useAuthFlow()
  const resetPasswordVisible = usePasswordVisibility("resetPassword")
  const resetConfirmVisible = usePasswordVisibility("resetConfirmPassword")

  return (
    <div className="flex w-full flex-col gap-8">
      <AuthEmailField
        helperLabel={t("form.labels.verificationSentTo")}
        mode="readonly"
        value={state.fields.resetEmail || t("form.demoEmail")}
      />
      <AuthOtpField
        ariaLabel={t("reset.codeLabel")}
        error={state.errors.resetCode}
        value={state.fields.resetCode}
        onValueChange={(value) => actions.update("resetCode", value)}
      />
      <AuthCodeResend
        actionLabel={t("form.resendAction")}
        countdownLabel={t("form.sentCountdown", {
          seconds: state.resend.remainingSeconds,
        })}
        pending={state.pending}
        prompt={t("form.resendPrompt")}
        remainingSeconds={state.resend.remainingSeconds}
        onResend={() => void actions.resend()}
      />
      <div className="flex w-full flex-col gap-6">
        <AuthPasswordField
          autoComplete="new-password"
          concealLabel={t("form.actions.hidePassword")}
          error={state.errors.resetPassword}
          label={t("form.labels.newPassword")}
          name="reset-password"
          placeholder={t("form.placeholders.password")}
          revealLabel={t("form.actions.showPassword")}
          value={state.fields.resetPassword}
          visible={resetPasswordVisible}
          onToggleVisibility={() => actions.togglePasswordVisibility("resetPassword")}
          onValueChange={(value) => actions.update("resetPassword", value)}
        />
        <AuthPasswordField
          autoComplete="new-password"
          concealLabel={t("form.actions.hidePassword")}
          error={state.errors.resetConfirmPassword}
          label={t("form.labels.confirmNewPassword")}
          name="reset-confirm-password"
          placeholder={t("form.placeholders.password")}
          revealLabel={t("form.actions.showPassword")}
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
        {t("form.buttons.resetPassword")}
        {state.pending ? <PendingIcon /> : <ArrowRightIcon data-icon="inline-end" />}
      </Button>
    </div>
  )
}

export function RegisterSuccessPanel() {
  const t = useTranslations("AuthUi")
  const { state } = useAuthFlow()

  return (
    <AuthSuccessPanel
      description={state.success.description ?? t("success.verifyDescription")}
      title={state.success.title ?? t("success.verifyTitle")}
    />
  )
}

export function ResetSuccessPanel() {
  const t = useTranslations("AuthUi")
  const { state } = useAuthFlow()

  return (
    <AuthSuccessPanel
      description={state.success.description ?? t("success.resetDescription")}
      title={state.success.title ?? t("success.resetTitle")}
    />
  )
}
