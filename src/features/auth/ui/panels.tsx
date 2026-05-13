"use client"

import * as React from "react"
import { ArrowRightIcon, CornerUpRightIcon, MailIcon } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
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
import { Button, type ButtonStatusCopy } from "@/components/ui/button"
import { copySlideSwap } from "@/lib/motion/recipes"
import { motionTokens } from "@/lib/motion/tokens"
import { cn } from "@/lib/utils"

import { useAuthFlow } from "@/features/auth/model"

import { useAuthProviderSectionMotion } from "./auth-provider-section"
import {
  AUTH_FORM_STAGGER_STATE_ATTR,
  getAuthSharedEnterItemProps,
  useAuthFormEnterStagger,
} from "./auth-stagger"

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

function useAuthSubmitButtonStatusCopy(): ButtonStatusCopy {
  const t = useTranslations("AuthUi")

  return {
    loading: t("form.status.loading"),
    success: t("form.status.success"),
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

function FormEnterScope({
  children,
  className,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  const { pageEnterReady } = useAuthProviderSectionMotion()
  const {
    scope: formEnterScope,
    stage: formEnterStage,
  } = useAuthFormEnterStagger(pageEnterReady)

  return (
    <div
      ref={formEnterScope}
      className={cn(className)}
      {...{ [AUTH_FORM_STAGGER_STATE_ATTR]: formEnterStage }}
      {...props}
    >
      {children}
    </div>
  )
}

function FormStack({
  children,
  className,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

function FormItem({
  children,
  className,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn(className)} {...getAuthSharedEnterItemProps()} {...props}>
      {children}
    </div>
  )
}

function AnimatedSubmitLabel({ label }: { label: string }) {
  const { submitCopySwapEnabled } = useAuthProviderSectionMotion()
  const reducedMotion = useReducedMotion() ?? false
  const submitCopyMotion = copySlideSwap({
    reducedMotion,
    distance: motionTokens.distance.xs,
  })

  if (!submitCopySwapEnabled) {
    return label
  }

  return (
    <span className="inline-grid overflow-hidden align-middle">
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={label}
          animate="visible"
          className="col-start-1 row-start-1"
          exit="exit"
          initial="hidden"
          variants={submitCopyMotion}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function LoginPanel() {
  const t = useTranslations("AuthUi")
  const { actions } = useAuthFlow()

  return (
    <FormEnterScope className="w-full" data-auth-flow="login">
      <FormItem className="w-full">
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
      </FormItem>
    </FormEnterScope>
  )
}

export function RegisterPanel() {
  const t = useTranslations("AuthUi")
  const { actions } = useAuthFlow()

  return (
    <FormEnterScope className="w-full" data-auth-flow="register">
      <FormItem className="w-full">
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
      </FormItem>
    </FormEnterScope>
  )
}

export function LoginEmailPanel() {
  const { actions, state } = useAuthFlow()
  const passwordVisible = usePasswordVisibility("loginPassword")
  const { accountFieldCopy, passwordFieldCopy, submitLabel } = useLoginEmailPanelCopy()
  const submitStatusCopy = useAuthSubmitButtonStatusCopy()

  return (
    <FormEnterScope className="flex w-full flex-col gap-8" data-auth-flow="login-email">
      <FormStack className="flex w-full flex-col gap-6">
        <FormItem>
          <AuthAccountField
            {...accountFieldCopy}
            autoComplete="username"
            countryCode={state.fields.loginCountryCode}
            error={state.errors.loginAccount}
            name="login-account"
            value={state.fields.loginAccount}
            onBlur={() => actions.blurField("loginAccount")}
            onCountryCodeChange={(value) => actions.update("loginCountryCode", value)}
            onValueChange={(value) => actions.update("loginAccount", value)}
          />
        </FormItem>
        <FormItem>
          <AuthPasswordField
            {...passwordFieldCopy}
            autoComplete="current-password"
            error={state.errors.loginPassword}
            name="login-password"
            value={state.fields.loginPassword}
            visible={passwordVisible}
            onBlur={() => actions.blurField("loginPassword")}
            onSupportAction={() => actions.switchFlow("forgot-password")}
            onToggleVisibility={() => actions.togglePasswordVisibility("loginPassword")}
            onValueChange={(value) => actions.update("loginPassword", value)}
          />
        </FormItem>
      </FormStack>
      <FormItem>
        <Button
          className="w-full"
          disabled={state.pending}
          size="large"
          status={state.submitStatus}
          statusCopy={submitStatusCopy}
          type="button"
          variant="primary"
          onClick={() => void actions.submit()}
        >
          <AnimatedSubmitLabel label={submitLabel} />
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </FormItem>
    </FormEnterScope>
  )
}

export function RegisterEmailPanel() {
  const { actions, state } = useAuthFlow()
  const registerPasswordVisible = usePasswordVisibility("registerPassword")
  const confirmPasswordVisible = usePasswordVisibility("registerConfirmPassword")
  const submitStatusCopy = useAuthSubmitButtonStatusCopy()
  const {
    emailFieldCopy,
    confirmPasswordFieldCopy,
    passwordFieldCopy,
    submitLabel,
  } = useRegisterEmailPanelCopy()

  return (
    <FormEnterScope
      className="flex w-full flex-col gap-8"
      data-auth-flow="register-email"
    >
      <FormStack className="flex w-full flex-col gap-6">
        <FormItem>
          <AuthEmailField
            {...emailFieldCopy}
            autoComplete="email"
            error={state.errors.registerAccount}
            name="register-account"
            value={state.fields.registerAccount}
            onBlur={() => actions.blurField("registerAccount")}
            onValueChange={(value) => actions.update("registerAccount", value)}
          />
        </FormItem>
        <FormItem>
          <AuthPasswordField
            {...passwordFieldCopy}
            autoComplete="new-password"
            error={state.errors.registerPassword}
            name="register-password"
            value={state.fields.registerPassword}
            visible={registerPasswordVisible}
            onBlur={() => actions.blurField("registerPassword")}
            onToggleVisibility={() => actions.togglePasswordVisibility("registerPassword")}
            onValueChange={(value) => actions.update("registerPassword", value)}
          />
        </FormItem>
        <FormItem>
          <AuthPasswordField
            {...confirmPasswordFieldCopy}
            autoComplete="new-password"
            error={state.errors.registerConfirmPassword}
            name="register-confirm-password"
            value={state.fields.registerConfirmPassword}
            visible={confirmPasswordVisible}
            onBlur={() => actions.blurField("registerConfirmPassword")}
            onToggleVisibility={() =>
              actions.togglePasswordVisibility("registerConfirmPassword")
            }
            onValueChange={(value) =>
              actions.update("registerConfirmPassword", value)
            }
          />
        </FormItem>
      </FormStack>
      <FormItem>
        <Button
          className="w-full"
          disabled={state.pending}
          size="large"
          status={state.submitStatus}
          statusCopy={submitStatusCopy}
          type="button"
          variant="primary"
          onClick={() => void actions.submit()}
        >
          {submitLabel}
          <CornerUpRightIcon data-icon="inline-end" />
        </Button>
      </FormItem>
    </FormEnterScope>
  )
}

export function ForgotPasswordPanel() {
  const { actions, state } = useAuthFlow()
  const { emailFieldCopy, submitLabel } = useForgotPasswordPanelCopy()
  const submitStatusCopy = useAuthSubmitButtonStatusCopy()

  return (
    <FormEnterScope
      className="flex w-full flex-col gap-8"
      data-auth-flow="forgot-password"
    >
      <FormItem>
        <AuthEmailField
          {...emailFieldCopy}
          autoComplete="email"
          error={state.errors.forgotEmail}
          name="forgot-email"
          value={state.fields.forgotEmail}
          onBlur={() => actions.blurField("forgotEmail")}
          onValueChange={(value) => actions.update("forgotEmail", value)}
        />
      </FormItem>
      <FormItem>
        <Button
          className="w-full"
          disabled={state.pending}
          size="large"
          status={state.submitStatus}
          statusCopy={submitStatusCopy}
          type="button"
          variant="primary"
          onClick={() => void actions.submit()}
        >
          <AnimatedSubmitLabel label={submitLabel} />
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </FormItem>
    </FormEnterScope>
  )
}

export function VerifyEmailPanel() {
  const { actions, state } = useAuthFlow()
  const submitStatusCopy = useAuthSubmitButtonStatusCopy()
  const { fallbackEmail, otpFieldCopy, readonlyEmailCopy, resendCopy, submitLabel } =
    useVerifyEmailPanelCopy(state.resend.remainingSeconds)

  return (
    <FormEnterScope className="flex w-full flex-col gap-8" data-auth-flow="verify-email">
      <FormItem>
        <AuthEmailField
          {...readonlyEmailCopy}
          mode="readonly"
          value={state.fields.verifyEmail || fallbackEmail}
        />
      </FormItem>
      <FormItem>
        <AuthOtpField
          {...otpFieldCopy}
          error={state.errors.verifyCode}
          value={state.fields.verifyCode}
          onBlur={() => actions.blurField("verifyCode")}
          onValueChange={(value) => actions.update("verifyCode", value)}
        />
      </FormItem>
      <FormItem>
        <AuthCodeResend
          {...resendCopy}
          pending={state.pending}
          remainingSeconds={state.resend.remainingSeconds}
          onResend={() => void actions.resend()}
        />
      </FormItem>
      <FormItem>
        <Button
          className="w-full"
          disabled={state.pending}
          size="large"
          status={state.submitStatus}
          statusCopy={submitStatusCopy}
          type="button"
          variant="primary"
          onClick={() => void actions.submit()}
        >
          {submitLabel}
        </Button>
      </FormItem>
    </FormEnterScope>
  )
}

export function ResetPasswordPanel() {
  const { actions, state } = useAuthFlow()
  const resetPasswordVisible = usePasswordVisibility("resetPassword")
  const resetConfirmVisible = usePasswordVisibility("resetConfirmPassword")
  const submitStatusCopy = useAuthSubmitButtonStatusCopy()
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
    <FormEnterScope
      className="flex w-full flex-col gap-8"
      data-auth-flow="reset-password"
    >
      <FormItem>
        <AuthEmailField
          {...readonlyEmailCopy}
          mode="readonly"
          value={state.fields.resetEmail || fallbackEmail}
        />
      </FormItem>
      <FormItem>
        <AuthOtpField
          {...otpFieldCopy}
          error={state.errors.resetCode}
          value={state.fields.resetCode}
          onBlur={() => actions.blurField("resetCode")}
          onValueChange={(value) => actions.update("resetCode", value)}
        />
      </FormItem>
      <FormItem>
        <AuthCodeResend
          {...resendCopy}
          pending={state.pending}
          remainingSeconds={state.resend.remainingSeconds}
          onResend={() => void actions.resend()}
        />
      </FormItem>
      <div className="flex w-full flex-col gap-6">
        <FormStack className="flex w-full flex-col gap-6">
          <FormItem>
            <AuthPasswordField
              {...passwordFieldCopy}
              autoComplete="new-password"
              error={state.errors.resetPassword}
              name="reset-password"
              value={state.fields.resetPassword}
              visible={resetPasswordVisible}
              onBlur={() => actions.blurField("resetPassword")}
              onToggleVisibility={() =>
                actions.togglePasswordVisibility("resetPassword")
              }
              onValueChange={(value) => actions.update("resetPassword", value)}
            />
          </FormItem>
          <FormItem>
            <AuthPasswordField
              {...confirmPasswordFieldCopy}
              autoComplete="new-password"
              error={state.errors.resetConfirmPassword}
              name="reset-confirm-password"
              value={state.fields.resetConfirmPassword}
              visible={resetConfirmVisible}
              onBlur={() => actions.blurField("resetConfirmPassword")}
              onToggleVisibility={() =>
                actions.togglePasswordVisibility("resetConfirmPassword")
              }
              onValueChange={(value) =>
                actions.update("resetConfirmPassword", value)
              }
            />
          </FormItem>
        </FormStack>
      </div>
      <FormItem>
        <Button
          className="w-full"
          disabled={state.pending}
          size="large"
          status={state.submitStatus}
          statusCopy={submitStatusCopy}
          type="button"
          variant="primary"
          onClick={() => void actions.submit()}
        >
          {submitLabel}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </FormItem>
    </FormEnterScope>
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
