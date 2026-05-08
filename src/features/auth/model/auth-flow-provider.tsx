"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resendActivationEmail,
  resetPassword,
  verifyRegistrationEmail,
} from "@/features/auth"
import { normalizeClientError } from "@/lib/api/normalize-client-error"
import { normalizeOptionalPhoneCountryCodeInput } from "@/lib/format/phone"

import type { AuthFieldName, AuthFlow, AuthFlowContextValue } from "./types"

const RESEND_COUNTDOWN_SECONDS = 60
const SUCCESS_REDIRECT_DELAY_MS = 1600
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const AuthFlowContext = React.createContext<AuthFlowContextValue | null>(null)

const defaultFields: Record<AuthFieldName, string> = {
  loginAccount: "",
  loginCountryCode: "+86",
  loginPassword: "",
  registerAccount: "",
  registerPassword: "",
  registerConfirmPassword: "",
  forgotEmail: "",
  verifyEmail: "",
  verifyCode: "",
  resetEmail: "",
  resetCode: "",
  resetPassword: "",
  resetConfirmPassword: "",
}

interface AuthFlowProviderProps {
  initialFlow: AuthFlow
  locale: string
  returnTo?: string | null
  children: React.ReactNode
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function looksLikePhone(value: string) {
  return /^\+?[0-9()\s-]{6,20}$/.test(value)
}

function usesPhoneAccountVariant(value: string) {
  const trimmed = value.trim()

  return trimmed.length > 0 && /^\d+$/.test(trimmed)
}

function isResolvableLoginAccount(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }

  if (trimmed.includes("@")) {
    return looksLikeEmail(trimmed)
  }

  if (/^\+?[0-9()\s-]+$/.test(trimmed)) {
    return looksLikePhone(trimmed)
  }

  return true
}

export function AuthFlowProvider({
  initialFlow,
  locale,
  returnTo,
  children,
}: AuthFlowProviderProps) {
  const router = useRouter()
  const t = useTranslations("AuthUi")
  const validationT = useTranslations("AuthUi.form.validation")
  const errorsT = useTranslations("AuthUi.form.errors")
  const successT = useTranslations("AuthUi.success")
  const defaultDemoEmail = t("form.demoEmail")

  const [flow, setFlow] = React.useState<AuthFlow>(initialFlow)
  const [fields, setFields] = React.useState<Record<string, string>>(defaultFields)
  const [errors, setErrors] = React.useState<Record<string, string | null>>({})
  const [pending, setPending] = React.useState(false)
  const [remainingSeconds, setRemainingSeconds] = React.useState(0)
  const [success, setSuccess] = React.useState<{
    visible: boolean
    title: string | null
    description: string | null
  }>({
    visible: false,
    title: null,
    description: null,
  })
  const [passwordVisibility, setPasswordVisibility] = React.useState<Record<string, boolean>>({})
  const [device, setDevice] = React.useState<"desktop" | "mobile">("mobile")

  const resendTimerRef = React.useRef<number | null>(null)
  const successTimerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const updateDevice = () => setDevice(mediaQuery.matches ? "desktop" : "mobile")

    updateDevice()
    mediaQuery.addEventListener("change", updateDevice)

    return () => mediaQuery.removeEventListener("change", updateDevice)
  }, [])

  React.useEffect(() => {
    if (remainingSeconds <= 0 && resendTimerRef.current) {
      window.clearInterval(resendTimerRef.current)
      resendTimerRef.current = null
    }
  }, [remainingSeconds])

  React.useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        window.clearInterval(resendTimerRef.current)
      }

      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current)
      }
    }
  }, [])

  const startResendCountdown = React.useCallback(() => {
    if (resendTimerRef.current) {
      window.clearInterval(resendTimerRef.current)
    }

    setRemainingSeconds(RESEND_COUNTDOWN_SECONDS)
    resendTimerRef.current = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          if (resendTimerRef.current) {
            window.clearInterval(resendTimerRef.current)
            resendTimerRef.current = null
          }

          return 0
        }

        return current - 1
      })
    }, 1000)
  }, [])

  const update = React.useCallback((name: string, value: string) => {
    setFields((current) => ({
      ...current,
      [name]: value,
    }))
    setErrors((current) => ({
      ...current,
      [name]: null,
    }))
  }, [])

  const togglePasswordVisibility = React.useCallback((field: string) => {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }))
  }, [])

  const switchFlow = React.useCallback(
    (nextFlow: AuthFlow) => {
      setErrors({})
      setPending(false)
      setSuccess({
        visible: false,
        title: null,
        description: null,
      })

      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }

      setFlow(nextFlow)

      if (nextFlow === "forgot-password" && !fields.forgotEmail && looksLikeEmail(fields.loginAccount)) {
        setFields((current) => ({
          ...current,
          forgotEmail: current.loginAccount.trim(),
        }))
      }

      if (
        nextFlow === "login-email" &&
        !fields.loginAccount &&
        looksLikeEmail(fields.forgotEmail)
      ) {
        setFields((current) => ({
          ...current,
          loginAccount: current.forgotEmail.trim(),
        }))
      }
    },
    [fields.forgotEmail, fields.loginAccount]
  )

  const scheduleFallbackRedirect = React.useCallback(
    (fallbackFlow: AuthFlow) => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current)
      }

      successTimerRef.current = window.setTimeout(() => {
        if (returnTo) {
          router.replace(returnTo)
          return
        }

        switchFlow(fallbackFlow)
      }, SUCCESS_REDIRECT_DELAY_MS)
    },
    [returnTo, router, switchFlow]
  )

  const submit = React.useCallback(async () => {
    const nextErrors: Record<string, string | null> = {}

    if (flow === "login-email") {
      if (!fields.loginAccount.trim()) {
        nextErrors.loginAccount = validationT("accountRequired")
      } else if (!isResolvableLoginAccount(fields.loginAccount)) {
        nextErrors.loginAccount = validationT("accountInvalid")
      }

      if (!fields.loginPassword.trim()) {
        nextErrors.loginPassword = validationT("passwordRequired")
      }
    }

    if (flow === "register-email") {
      if (!fields.registerAccount.trim()) {
        nextErrors.registerAccount = validationT("emailRequired")
      } else if (!looksLikeEmail(fields.registerAccount)) {
        nextErrors.registerAccount = validationT("emailInvalid")
      }

      if (!fields.registerPassword.trim()) {
        nextErrors.registerPassword = validationT("passwordRequired")
      } else if (!PASSWORD_RULE.test(fields.registerPassword)) {
        nextErrors.registerPassword = validationT("passwordInvalid")
      }

      if (!fields.registerConfirmPassword.trim()) {
        nextErrors.registerConfirmPassword = validationT("confirmPasswordRequired")
      } else if (fields.registerConfirmPassword !== fields.registerPassword) {
        nextErrors.registerConfirmPassword = validationT("confirmPasswordMismatch")
      }
    }

    if (flow === "forgot-password") {
      if (!fields.forgotEmail.trim()) {
        nextErrors.forgotEmail = validationT("emailRequired")
      } else if (!looksLikeEmail(fields.forgotEmail)) {
        nextErrors.forgotEmail = validationT("emailInvalid")
      }
    }

    if (flow === "verify-email") {
      if (!fields.verifyCode.trim()) {
        nextErrors.verifyCode = validationT("codeRequired")
      }
    }

    if (flow === "reset-password") {
      if (!fields.resetCode.trim()) {
        nextErrors.resetCode = validationT("codeRequired")
      }

      if (!fields.resetPassword.trim()) {
        nextErrors.resetPassword = validationT("passwordRequired")
      } else if (!PASSWORD_RULE.test(fields.resetPassword)) {
        nextErrors.resetPassword = validationT("passwordInvalid")
      }

      if (!fields.resetConfirmPassword.trim()) {
        nextErrors.resetConfirmPassword = validationT("confirmPasswordRequired")
      } else if (fields.resetConfirmPassword !== fields.resetPassword) {
        nextErrors.resetConfirmPassword = validationT("confirmPasswordMismatch")
      }
    }

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    setPending(true)
    setErrors({})

    try {
      if (flow === "login-email") {
        await loginUser({
          account: fields.loginAccount.trim(),
          countryCode: usesPhoneAccountVariant(fields.loginAccount)
            ? normalizeOptionalPhoneCountryCodeInput(fields.loginCountryCode)
            : null,
          password: fields.loginPassword,
        })

        toast.success(successT("loginTitle"), {
          description: successT("loginDescription"),
        })

        if (returnTo) {
          router.replace(returnTo)
        } else {
          setFields((current) => ({
            ...current,
            loginPassword: "",
          }))
        }

        return
      }

      if (flow === "register-email") {
        const registerEmail = fields.registerAccount.trim().toLowerCase()

        await registerUser({
          email: registerEmail,
          password: fields.registerPassword,
        })

        setFields((current) => ({
          ...current,
          verifyEmail: registerEmail,
          verifyCode: "",
        }))
        startResendCountdown()
        setFlow("verify-email")
        return
      }

      if (flow === "forgot-password") {
        const recoveryEmail = fields.forgotEmail.trim().toLowerCase()

        await requestPasswordReset({
          account: recoveryEmail,
        })

        setFields((current) => ({
          ...current,
          resetEmail: recoveryEmail,
          resetCode: "",
        }))
        startResendCountdown()
        setFlow("reset-password")
        return
      }

      if (flow === "verify-email") {
        await verifyRegistrationEmail({
          email: fields.verifyEmail || defaultDemoEmail,
          code: fields.verifyCode.trim(),
        })

        setSuccess({
          visible: true,
          title: successT("verifyTitle"),
          description: successT("verifyDescription"),
        })
        setFlow("register-success")
        scheduleFallbackRedirect("login")
        return
      }

      if (flow === "reset-password") {
        await resetPassword({
          account: fields.resetEmail || defaultDemoEmail,
          code: fields.resetCode.trim(),
          newPassword: fields.resetPassword,
        })

        setSuccess({
          visible: true,
          title: successT("resetTitle"),
          description: successT("resetDescription"),
        })
        setFlow("reset-success")
        scheduleFallbackRedirect("login-email")
      }
    } catch (error) {
      const normalizedError = normalizeClientError(error)

      let fallbackMessage = normalizedError.message
      if (flow === "login-email") {
        fallbackMessage = errorsT("loginFailed")
      }
      if (flow === "register-email") {
        fallbackMessage = errorsT("registerFailed")
      }
      if (flow === "forgot-password") {
        fallbackMessage = errorsT("resetRequestFailed")
      }
      if (flow === "verify-email") {
        fallbackMessage = errorsT("verifyFailed")
      }
      if (flow === "reset-password") {
        fallbackMessage = errorsT("resetFailed")
      }

      const codeFieldName =
        flow === "verify-email"
          ? "verifyCode"
          : flow === "reset-password"
            ? "resetCode"
            : null
      const fieldErrorMessage = normalizedError.message || fallbackMessage

      if (codeFieldName) {
        setErrors({
          [codeFieldName]: fieldErrorMessage,
        })
      }

      toast.error(fallbackMessage, {
        description:
          normalizedError.message && normalizedError.message !== fallbackMessage
            ? normalizedError.message
            : undefined,
      })
    } finally {
      setPending(false)
    }
  }, [
    defaultDemoEmail,
    errorsT,
    fields.forgotEmail,
    fields.loginAccount,
    fields.loginCountryCode,
    fields.loginPassword,
    fields.registerAccount,
    fields.registerConfirmPassword,
    fields.registerPassword,
    fields.resetCode,
    fields.resetConfirmPassword,
    fields.resetEmail,
    fields.resetPassword,
    fields.verifyCode,
    fields.verifyEmail,
    flow,
    returnTo,
    router,
    scheduleFallbackRedirect,
    startResendCountdown,
    successT,
    validationT,
  ])

  const resend = React.useCallback(async () => {
    if (remainingSeconds > 0) {
      return
    }

    setPending(true)
    try {
      if (flow === "verify-email") {
        await resendActivationEmail({
          email: fields.verifyEmail || defaultDemoEmail,
        })
      } else if (flow === "reset-password") {
        await requestPasswordReset({
          account: fields.resetEmail || defaultDemoEmail,
        })
      } else {
        return
      }

      startResendCountdown()
      toast.success(t("form.resendSuccess"))
    } catch (error) {
      const normalizedError = normalizeClientError(error)
      toast.error(errorsT("resendFailed"), {
        description: normalizedError.message,
      })
    } finally {
      setPending(false)
    }
  }, [
    defaultDemoEmail,
    errorsT,
    fields.resetEmail,
    fields.verifyEmail,
    flow,
    remainingSeconds,
    startResendCountdown,
    t,
  ])

  const value = React.useMemo<AuthFlowContextValue>(
    () => ({
      state: {
        fields,
        errors,
        pending,
        resend: {
          status: remainingSeconds > 0 ? "countdown" : "idle",
          remainingSeconds,
        },
        success,
      },
      actions: {
        update,
        submit,
        resend,
        togglePasswordVisibility,
        switchFlow,
      },
      meta: {
        flow,
        device,
        refs: {
          passwordVisibility,
          resendTimerRef,
          successTimerRef,
          locale,
          returnTo,
        },
      },
    }),
    [
      device,
      errors,
      fields,
      flow,
      locale,
      passwordVisibility,
      pending,
      remainingSeconds,
      resend,
      returnTo,
      submit,
      success,
      switchFlow,
      togglePasswordVisibility,
      update,
    ]
  )

  return <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>
}

export function useAuthFlow() {
  const context = React.useContext(AuthFlowContext)

  if (!context) {
    throw new Error("useAuthFlow must be used within AuthFlowProvider")
  }

  return context
}
