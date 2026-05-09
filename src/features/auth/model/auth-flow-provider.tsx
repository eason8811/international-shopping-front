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

import type {
  AuthFieldName,
  AuthFlow,
  AuthFlowContextValue,
  AuthSubmitStatus,
} from "./types"

const RESEND_COUNTDOWN_SECONDS = 60
const SUBMIT_SUCCESS_HOLD_MS = 500
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

const flowFieldNames: Record<AuthFlow, readonly AuthFieldName[]> = {
  login: [],
  "login-email": ["loginAccount", "loginPassword"],
  "forgot-password": ["forgotEmail"],
  "reset-password": ["resetCode", "resetPassword", "resetConfirmPassword"],
  "reset-success": [],
  register: [],
  "register-email": [
    "registerAccount",
    "registerPassword",
    "registerConfirmPassword",
  ],
  "verify-email": ["verifyCode"],
  "register-success": [],
}

const dependentValidationFields: Partial<
  Record<AuthFieldName, readonly AuthFieldName[]>
> = {
  registerPassword: ["registerConfirmPassword"],
  resetPassword: ["resetConfirmPassword"],
}

function markFieldsTouched(
  fieldNames: readonly AuthFieldName[],
  current: Partial<Record<AuthFieldName, boolean>>
) {
  const next = { ...current }

  for (const fieldName of fieldNames) {
    next[fieldName] = true
  }

  return next
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
  const [fields, setFields] = React.useState<Record<AuthFieldName, string>>(defaultFields)
  const [errors, setErrors] = React.useState<Partial<Record<AuthFieldName, string | null>>>({})
  const [touchedFields, setTouchedFields] = React.useState<Partial<Record<AuthFieldName, boolean>>>({})
  const [pending, setPending] = React.useState(false)
  const [submitStatus, setSubmitStatus] = React.useState<AuthSubmitStatus>("idle")
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

  const validateField = React.useCallback(
    (
      fieldName: AuthFieldName,
      currentFields: Record<AuthFieldName, string>,
      currentFlow: AuthFlow
    ) => {
      if (fieldName === "loginAccount") {
        if (currentFlow !== "login-email")
          return null

        if (!currentFields.loginAccount.trim())
          return validationT("accountRequired")

        if (!isResolvableLoginAccount(currentFields.loginAccount))
          return validationT("accountInvalid")
      }

      if (fieldName === "loginPassword") {
        if (currentFlow !== "login-email")
          return null

        if (!currentFields.loginPassword.trim())
          return validationT("passwordRequired")
      }

      if (fieldName === "registerAccount") {
        if (currentFlow !== "register-email")
          return null

        if (!currentFields.registerAccount.trim())
          return validationT("emailRequired")

        if (!looksLikeEmail(currentFields.registerAccount))
          return validationT("emailInvalid")
      }

      if (fieldName === "registerPassword") {
        if (currentFlow !== "register-email")
          return null

        if (!currentFields.registerPassword.trim())
          return validationT("passwordRequired")

        if (!PASSWORD_RULE.test(currentFields.registerPassword))
          return validationT("passwordInvalid")
      }

      if (fieldName === "registerConfirmPassword") {
        if (currentFlow !== "register-email")
          return null

        if (!currentFields.registerConfirmPassword.trim())
          return validationT("confirmPasswordRequired")

        if (currentFields.registerConfirmPassword !== currentFields.registerPassword)
          return validationT("confirmPasswordMismatch")
      }

      if (fieldName === "forgotEmail") {
        if (currentFlow !== "forgot-password")
          return null

        if (!currentFields.forgotEmail.trim())
          return validationT("emailRequired")

        if (!looksLikeEmail(currentFields.forgotEmail))
          return validationT("emailInvalid")
      }

      if (fieldName === "verifyCode") {
        if (currentFlow !== "verify-email")
          return null

        if (!currentFields.verifyCode.trim())
          return validationT("codeRequired")
      }

      if (fieldName === "resetCode") {
        if (currentFlow !== "reset-password")
          return null

        if (!currentFields.resetCode.trim())
          return validationT("codeRequired")
      }

      if (fieldName === "resetPassword") {
        if (currentFlow !== "reset-password")
          return null

        if (!currentFields.resetPassword.trim())
          return validationT("passwordRequired")

        if (!PASSWORD_RULE.test(currentFields.resetPassword))
          return validationT("passwordInvalid")
      }

      if (fieldName === "resetConfirmPassword") {
        if (currentFlow !== "reset-password")
          return null

        if (!currentFields.resetConfirmPassword.trim())
          return validationT("confirmPasswordRequired")

        if (currentFields.resetConfirmPassword !== currentFields.resetPassword)
          return validationT("confirmPasswordMismatch")
      }

      return null
    },
    [validationT]
  )

  const validateFields = React.useCallback(
    (
      fieldNames: readonly AuthFieldName[],
      currentFields: Record<AuthFieldName, string>,
      currentFlow: AuthFlow
    ) => {
      const nextErrors: Partial<Record<AuthFieldName, string | null>> = {}

      for (const fieldName of fieldNames) {
        const error = validateField(fieldName, currentFields, currentFlow)

        if (error)
          nextErrors[fieldName] = error
      }

      return nextErrors
    },
    [validateField]
  )

  const update = React.useCallback(
    (name: AuthFieldName, value: string) => {
      setFields((currentFields) => {
        const nextFields = {
          ...currentFields,
          [name]: value,
        }

        setErrors((currentErrors) => {
          const nextErrors = {
            ...currentErrors,
            [name]: null,
          }
          const fieldsToRevalidate = new Set<AuthFieldName>()

          if (touchedFields[name])
            fieldsToRevalidate.add(name)

          for (const dependentField of dependentValidationFields[name] ?? [])
            if (touchedFields[dependentField])
              fieldsToRevalidate.add(dependentField)

          for (const fieldName of fieldsToRevalidate)
            nextErrors[fieldName] = validateField(fieldName, nextFields, flow)

          return nextErrors
        })

        return nextFields
      })
    },
    [flow, touchedFields, validateField]
  )

  const blurField = React.useCallback(
    (name: AuthFieldName) => {
      setTouchedFields((current) => markFieldsTouched([name], current))
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors }
        const fieldsToValidate = new Set<AuthFieldName>([name])

        for (const dependentField of dependentValidationFields[name] ?? [])
          if (touchedFields[dependentField])
            fieldsToValidate.add(dependentField)


        for (const fieldName of fieldsToValidate)
          nextErrors[fieldName] = validateField(fieldName, fields, flow)

        return nextErrors
      })
    },
    [fields, flow, touchedFields, validateField]
  )

  const togglePasswordVisibility = React.useCallback((field: string) => {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }))
  }, [])

  const holdSubmitSuccess = React.useCallback(async () => {
    setSubmitStatus("success")

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, SUBMIT_SUCCESS_HOLD_MS)
    })
  }, [])

  const switchFlow = React.useCallback(
    (nextFlow: AuthFlow) => {
      setErrors({})
      setTouchedFields({})
      setPending(false)
      setSubmitStatus("idle")
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
    const activeFieldNames = flowFieldNames[flow]
    const nextErrors = validateFields(activeFieldNames, fields, flow)

    setTouchedFields((current) => markFieldsTouched(activeFieldNames, current))

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    setPending(true)
    setSubmitStatus("loading")
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

        await holdSubmitSuccess()

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

        await holdSubmitSuccess()

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

        await holdSubmitSuccess()

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

        await holdSubmitSuccess()

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

        await holdSubmitSuccess()

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
      setSubmitStatus("idle")
    }
  }, [
    defaultDemoEmail,
    errorsT,
    fields,
    flow,
    holdSubmitSuccess,
    returnTo,
    router,
    scheduleFallbackRedirect,
    startResendCountdown,
    successT,
    validateFields,
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
        submitStatus,
        resend: {
          status: remainingSeconds > 0 ? "countdown" : "idle",
          remainingSeconds,
        },
        success,
      },
      actions: {
        update,
        blurField,
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
      submitStatus,
      blurField,
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
