"use client"

import * as React from "react"
import {
    AnimatePresence,
    LayoutGroup,
    motion,
    usePresenceData,
    useReducedMotion,
    type Variants,
} from "motion/react"
import { toast } from "sonner"

import {
    AuthBlock,
    AuthEmailButton,
    AuthEmailForm,
    AuthFooterLink,
    AuthHeroText,
    AuthPageShell,
    AuthRegisterForm,
    AuthResetPasswordForm,
    AuthSuccess,
    AuthVerifyForm,
    type AuthProvider,
    type AuthShellCopy,
} from "@/components/blocks"
import {
    getAuthFadeItemVariants,
    getAuthStaggerContainerVariants,
} from "@/components/blocks/auth-motion"
import type { ButtonStatus } from "@/components/ui/button"
import {
    loginUser,
    registerUser,
    requestPasswordReset,
    resendActivationEmail,
    resetPassword,
    verifyRegistrationEmail,
} from "@/features/auth"
import { normalizeClientError, type NormalizedClientError } from "@/lib/api/normalize-client-error"

type AuthMode =
    | "login"
    | "login-email"
    | "register"
    | "register-email"
    | "verify"
    | "forgot"
    | "reset"
    | "success"
type AuthFlow = "login" | "register" | "forgot" | "oauth"
type PendingAction = "login" | "register" | "verify" | "resend" | "forgot" | "reset" | "oauth"
type InitialOAuthStatus = "success" | "error"
type AuthInputField =
    | "loginAccount"
    | "loginPassword"
    | "registerEmail"
    | "registerPassword"
    | "registerConfirmPassword"
    | "recoveryAccount"
    | "newPassword"
    | "newConfirmPassword"
type AuthInputFieldState = Partial<Record<AuthInputField, boolean>>

interface AuthFormErrors {
    account?: string
    password?: string
    confirmPassword?: string
    code?: string
}

interface AuthSuccessState {
    title: string
    description: string
}

export interface AuthPageCopy {
    shell: AuthShellCopy
    login: {
        title: string
        subtitle: string
        divider: string
        continueWithEmail: string
        footerPrompt: string
        footerAction: string
    }
    register: {
        title: string
        subtitle: string
        divider: string
        continueWithEmail: string
        footerPrompt: string
        footerAction: string
    }
    forgot: {
        title: string
        subtitle: string
        footerPrompt: string
        footerAction: string
    }
    social: {
        google: string
        tiktok: string
        x: string
    }
    form: {
        labels: {
            account: string
            email: string
            password: string
            newPassword: string
            confirmPassword: string
            verificationSentTo: string
        }
        placeholders: {
            account: string
            email: string
            password: string
        }
        actions: {
            forgotPassword: string
            showPassword: string
            hidePassword: string
        }
        buttons: {
            signIn: string
            signUp: string
            sendCode: string
            verify: string
            resetPassword: string
        }
        resendPrompt: string
        resendAction: string
        sentCountdown: string
        resendSuccess: string
        errors: {
            loginFailed: string
            registerFailed: string
            verifyFailed: string
            resetRequestFailed: string
            resetFailed: string
            resendFailed: string
        }
        validation: {
            accountRequired: string
            accountInvalid: string
            codeRequired: string
            emailRequired: string
            emailInvalid: string
            phoneInvalid: string
            passwordRequired: string
            passwordInvalid: string
            confirmPasswordRequired: string
            confirmPasswordMismatch: string
        }
    }
    reset: {
        accountLabel: string
        codeLabel: string
    }
    success: {
        loginTitle: string
        loginDescription: string
        verifyTitle: string
        verifyDescription: string
        resetTitle: string
        resetDescription: string
        oauthTitle: string
        oauthDescription: string
    }
}

export interface AuthPageClientProps {
    copy: AuthPageCopy
    locale: string
    initialOAuthStatus?: InitialOAuthStatus
    initialOAuthError?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const PHONE_PATTERN = /^\d{6,20}$/
const MAX_EMAIL_LENGTH = 254
const DEFAULT_PHONE_COUNTRY_CODE = "86"
const BUTTON_SUCCESS_HOLD_MS = 450
const REDIRECT_DELAY_MS = 3000
const RESEND_COOLDOWN_SECONDS = 60
const RECOVERY_ACCOUNT_LAYOUT_ID = "auth-recovery-account-value"
const AUTH_MODE_PANEL_FADE_TRANSITION = { duration: 0.3 }

type AuthModePanelTransition = "expand" | "morph"

interface AuthModePanelCustom {
    transition: AuthModePanelTransition
    reducedMotion: boolean
}

const authModePanelVariants: Variants = {
    hidden: (custom: AuthModePanelCustom) => {
        if (custom.transition === "morph") {
            return { opacity: 0 }
        }

        return { height: 0, opacity: 0 }
    },
    visible: (custom: AuthModePanelCustom) => {
        if (custom.transition === "morph") {
            return {
                opacity: 1,
                transition: AUTH_MODE_PANEL_FADE_TRANSITION,
            }
        }

        return {
            height: "auto",
            opacity: 1,
            transition: {
                duration: custom.reducedMotion ? 0.12 : 0.3,
                ease: "easeOut",
                when: "beforeChildren",
            },
        }
    },
    exit: (custom: AuthModePanelCustom) => {
        if (custom.transition === "morph") {
            return {
                opacity: 0,
                transition: AUTH_MODE_PANEL_FADE_TRANSITION,
            }
        }

        return {
            height: 0,
            opacity: 0,
            transition: {
                duration: custom.reducedMotion ? 0.08 : 0.3,
                ease: "easeOut",
            },
        }
    },
}

export function AuthPageClient({
                                   copy,
                                   locale,
                                   initialOAuthStatus,
                                   initialOAuthError,
                               }: AuthPageClientProps) {
    const [mode, setMode] = React.useState<AuthMode>("login")
    const [authModePanelTransition, setAuthModePanelTransition] =
        React.useState<AuthModePanelTransition>("expand")
    const [flow, setFlow] = React.useState<AuthFlow>("login")
    const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(null)
    const [completedAction, setCompletedAction] = React.useState<PendingAction | null>(null)
    const [pendingOAuthProvider, setPendingOAuthProvider] = React.useState<AuthProvider | null>(null)
    const [formErrors, setFormErrors] = React.useState<AuthFormErrors>({})
    const [success, setSuccess] = React.useState<AuthSuccessState>({
        title: copy.success.loginTitle,
        description: copy.success.loginDescription,
    })
    const [successRedirectTo, setSuccessRedirectTo] = React.useState<string | null>(null)
    const [resendRemaining, setResendRemaining] = React.useState(0)
    const [resendNotice, setResendNotice] = React.useState<string | null>(null)

    const [loginAccount, setLoginAccount] = React.useState("")
    const [loginPassword, setLoginPassword] = React.useState("")
    const [loginCountryCode, setLoginCountryCode] = React.useState(DEFAULT_PHONE_COUNTRY_CODE)
    const [registerEmail, setRegisterEmail] = React.useState("")
    const [registerPassword, setRegisterPassword] = React.useState("")
    const [registerConfirmPassword, setRegisterConfirmPassword] = React.useState("")
    const [verificationCode, setVerificationCode] = React.useState("")
    const [recoveryAccount, setRecoveryAccount] = React.useState("")
    const [recoveryCountryCode, setRecoveryCountryCode] = React.useState(DEFAULT_PHONE_COUNTRY_CODE)
    const [recoveryCode, setRecoveryCode] = React.useState("")
    const [newPassword, setNewPassword] = React.useState("")
    const [newConfirmPassword, setNewConfirmPassword] = React.useState("")
    const [changedFields, setChangedFields] = React.useState<AuthInputFieldState>({})
    const [blurredFields, setBlurredFields] = React.useState<AuthInputFieldState>({})
    const changedFieldsRef = React.useRef<AuthInputFieldState>({})
    const initialOAuthHandledRef = React.useRef(false)
    const shouldReduceMotion = useReducedMotion()
    const itemVariants = getAuthFadeItemVariants(!!shouldReduceMotion)
    const containerVariants = getAuthStaggerContainerVariants(!!shouldReduceMotion)

    const isPending =
        pendingAction !== null ||
        completedAction !== null ||
        pendingOAuthProvider !== null
    const isRegister = flow === "register"
    const isForgot = flow === "forgot"
    const intro = isForgot ? copy.forgot : isRegister ? copy.register : copy.login
    const separatorLabel = isRegister ? copy.register.divider : copy.login.divider
    const authModePanelPresenceCustom: AuthModePanelCustom = {
        transition: authModePanelTransition,
        reducedMotion: !!shouldReduceMotion,
    }
    const providers: AuthProvider[] = ["google", "tiktok", "x"]
    const authProviders = providers.map((provider) => ({
        provider,
        label: copy.social[provider],
        disabled: isPending,
        status: getProviderButtonStatus(provider),
        onClick: () => startOAuth(provider),
    }))
    const changeMode = React.useCallback((nextMode: AuthMode) => {
        setAuthModePanelTransition(resolveAuthModePanelTransition(mode, nextMode))
        setMode(nextMode)
    }, [mode])

    React.useEffect(() => {
        if (initialOAuthHandledRef.current) {
            return
        }

        initialOAuthHandledRef.current = true

        if (initialOAuthStatus === "success") {
            setFlow("oauth")
            setSuccess({
                title: copy.success.oauthTitle,
                description: copy.success.oauthDescription,
            })
            setSuccessRedirectTo(resolveBrowserReturnTo())
            setFormErrors({})
            setPendingAction(null)
            setCompletedAction(null)
            setPendingOAuthProvider(null)
            changeMode("success")
            return
        }

        if (initialOAuthStatus === "error") {
            setFlow("login")
            changeMode("login")
            notifyRequestError({
                status: 400,
                code: "BAD_REQUEST",
                message: initialOAuthError || copy.form.errors.loginFailed,
            })
        }
    }, [
        copy.form.errors.loginFailed,
        copy.success.oauthDescription,
        copy.success.oauthTitle,
        changeMode,
        initialOAuthError,
        initialOAuthStatus,
    ])

    React.useEffect(() => {
        if (mode !== "success" || !successRedirectTo) {
            return
        }

        const timer = window.setTimeout(() => {
            window.location.assign(successRedirectTo)
        }, REDIRECT_DELAY_MS)

        return () => window.clearTimeout(timer)
    }, [mode, successRedirectTo])

    React.useEffect(() => {
        if (resendRemaining <= 0) {
            return
        }

        const timer = window.setTimeout(() => {
            setResendRemaining((current) => Math.max(0, current - 1))
        }, 1000)

        return () => window.clearTimeout(timer)
    }, [resendRemaining])

    function clearFeedback() {
        setFormErrors({})
        setResendNotice(null)
        setCompletedAction(null)
        setPendingOAuthProvider(null)
        toast.dismiss()
    }

    function switchToMode(nextMode: AuthMode, nextFlow: AuthFlow = flow) {
        clearFeedback()
        resetFieldInteraction()
        setFlow(nextFlow)
        changeMode(nextMode)
    }

    async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        clearFeedback()

        const errors = validateAccountPassword(loginAccount, loginPassword)
        if (hasErrors(errors)) {
            setFormErrors(errors)
            return
        }

        const succeeded = await runRequest("login", copy.form.errors.loginFailed, async () => {
            await loginUser({
                account: loginAccount.trim(),
                password: loginPassword,
                countryCode: getAccountCountryCode(loginAccount, loginCountryCode),
            })
        })

        if (succeeded) {
            finishWithSuccess("login")
        }
    }

    async function submitRegister(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        clearFeedback()

        const errors = validateRegister()
        if (hasErrors(errors)) {
            setFormErrors(errors)
            return
        }

        const succeeded = await runRequest("register", copy.form.errors.registerFailed, async () => {
            await registerUser({
                email: registerEmail.trim(),
                password: registerPassword,
                phoneCountryCode: null,
                phoneNationalNumber: null,
            })
        })

        if (succeeded) {
            setVerificationCode("")
            setResendRemaining(RESEND_COOLDOWN_SECONDS)
            setFlow("register")
            changeMode("verify")
        }
    }

    async function submitVerification(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        clearFeedback()

        if (verificationCode.length < 6) {
            setFormErrors({ code: copy.form.validation.codeRequired })
            return
        }

        const succeeded = await runRequest("verify", copy.form.errors.verifyFailed, async () => {
            await verifyRegistrationEmail({
                email: registerEmail.trim(),
                code: verificationCode,
            })
        })

        if (succeeded) {
            finishWithSuccess("verify")
        }
    }

    async function resendVerificationCode() {
        clearFeedback()

        if (resendRemaining > 0 || !registerEmail.trim()) {
            return
        }

        const succeeded = await runRequest("resend", copy.form.errors.resendFailed, async () => {
            await resendActivationEmail({ email: registerEmail.trim() })
        })

        if (succeeded) {
            setResendNotice(copy.form.resendSuccess)
            setResendRemaining(RESEND_COOLDOWN_SECONDS)
        }
    }

    async function submitForgotPassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        clearFeedback()

        const accountError = validateAccountField(
            recoveryAccount,
            copy.form.validation.accountRequired,
        )
        if (accountError) {
            setFormErrors({ account: accountError })
            return
        }

        const succeeded = await runRequest("forgot", copy.form.errors.resetRequestFailed, async () => {
            await requestPasswordReset({
                account: recoveryAccount.trim(),
                countryCode: getAccountCountryCode(recoveryAccount, recoveryCountryCode),
            })
        })

        if (succeeded) {
            setRecoveryCode("")
            setNewPassword("")
            setNewConfirmPassword("")
            setFlow("forgot")
            changeMode("reset")
        }
    }

    async function submitPasswordReset(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        clearFeedback()

        const errors = validatePasswordReset()
        if (hasErrors(errors)) {
            setFormErrors(errors)
            return
        }

        const succeeded = await runRequest("reset", copy.form.errors.resetFailed, async () => {
            await resetPassword({
                account: recoveryAccount.trim(),
                code: recoveryCode,
                newPassword,
                countryCode: getAccountCountryCode(recoveryAccount, recoveryCountryCode),
            })
        })

        if (succeeded) {
            finishWithSuccess("reset")
        }
    }

    function startOAuth(provider: AuthProvider) {
        clearFeedback()
        setPendingOAuthProvider(provider)
        setPendingAction("oauth")

        const url = new URL(`/api/bff/oauth2/${provider}/authorize`, window.location.origin)
        url.searchParams.set("locale", locale)

        const returnTo = resolveBrowserReturnTo()
        if (returnTo) {
            url.searchParams.set("returnTo", returnTo)
        }

        window.location.assign(url.toString())
    }

    function finishWithSuccess(kind: AuthFlow | "verify" | "reset") {
        const nextSuccess = getSuccessCopy(kind)
        setSuccess(nextSuccess)
        setSuccessRedirectTo(resolveBrowserReturnTo())
        setFormErrors({})
        resetFieldInteraction()
        setPendingAction(null)
        setCompletedAction(null)
        setPendingOAuthProvider(null)
        changeMode("success")
    }

    function getSuccessCopy(kind: AuthFlow | "verify" | "reset"): AuthSuccessState {
        if (kind === "verify") {
            return {
                title: copy.success.verifyTitle,
                description: copy.success.verifyDescription,
            }
        }

        if (kind === "reset") {
            return {
                title: copy.success.resetTitle,
                description: copy.success.resetDescription,
            }
        }

        if (kind === "oauth") {
            return {
                title: copy.success.oauthTitle,
                description: copy.success.oauthDescription,
            }
        }

        return {
            title: copy.success.loginTitle,
            description: copy.success.loginDescription,
        }
    }

    async function runRequest(
        action: PendingAction,
        fallbackMessage: string,
        callback: () => Promise<void>,
    ): Promise<boolean> {
        setCompletedAction(null)
        setPendingAction(action)
        try {
            await callback()
            setPendingAction((current) => (current === action ? null : current))
            setCompletedAction(action)
            await waitForButtonSuccess()
            return true
        } catch (error) {
            notifyRequestError(normalizeClientError(error, fallbackMessage))
            return false
        } finally {
            setPendingAction((current) => (current === action ? null : current))
            setCompletedAction((current) => (current === action ? null : current))
        }
    }

    function getButtonStatus(action: PendingAction): ButtonStatus {
        if (completedAction === action) {
            return "success"
        }

        if (pendingAction === action) {
            return "loading"
        }

        return "idle"
    }

    function getProviderButtonStatus(provider: AuthProvider): ButtonStatus {
        if (pendingAction === "oauth" && pendingOAuthProvider === provider) {
            return "loading"
        }

        return "idle"
    }

    function validateAccountPassword(account: string, password: string): AuthFormErrors {
        const errors: AuthFormErrors = {}
        const accountError = validateAccountField(
            account,
            copy.form.validation.accountRequired,
        )

        if (accountError) {
            errors.account = accountError
        }

        if (!password) {
            errors.password = copy.form.validation.passwordRequired
        }

        return errors
    }

    function validateRegister(): AuthFormErrors {
        const errors: AuthFormErrors = {}
        const accountError = validateEmailField(
            registerEmail,
            copy.form.validation.emailRequired,
        )

        if (accountError) {
            errors.account = accountError
        }

        const passwordError = validatePasswordField(registerPassword)
        if (passwordError) {
            errors.password = passwordError
        }

        const confirmPasswordError = validateConfirmPasswordField(
            registerConfirmPassword,
            registerPassword,
        )
        if (confirmPasswordError) {
            errors.confirmPassword = confirmPasswordError
        }

        return errors
    }

    function validatePasswordReset(): AuthFormErrors {
        const errors: AuthFormErrors = {}

        if (recoveryCode.length < 6) {
            errors.code = copy.form.validation.codeRequired
        }

        const passwordError = validatePasswordField(newPassword)
        if (passwordError) {
            errors.password = passwordError
        }

        const confirmPasswordError = validateConfirmPasswordField(
            newConfirmPassword,
            newPassword,
        )
        if (confirmPasswordError) {
            errors.confirmPassword = confirmPasswordError
        }

        return errors
    }

    function validateEmailField(value: string, requiredMessage: string) {
        const email = value.trim()

        if (!email) {
            return requiredMessage
        }

        if (
            value !== email ||
            value.length > MAX_EMAIL_LENGTH ||
            !EMAIL_PATTERN.test(email)
        ) {
            return copy.form.validation.emailInvalid
        }

        return undefined
    }

    function validateAccountField(value: string, requiredMessage: string) {
        const account = value.trim()

        if (!account) {
            return requiredMessage
        }

        if (value !== account) {
            return copy.form.validation.accountInvalid
        }

        if (isPhoneAccountValue(account)) {
            return PHONE_PATTERN.test(account)
                ? undefined
                : copy.form.validation.phoneInvalid
        }

        if (account.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(account)) {
            return copy.form.validation.accountInvalid
        }

        return undefined
    }

    function validatePasswordField(value: string) {
        if (!value) {
            return copy.form.validation.passwordRequired
        }

        if (!PASSWORD_PATTERN.test(value)) {
            return copy.form.validation.passwordInvalid
        }

        return undefined
    }

    function validateRequiredPasswordField(value: string) {
        return value ? undefined : copy.form.validation.passwordRequired
    }

    function validateConfirmPasswordField(value: string, password: string) {
        if (!value) {
            return copy.form.validation.confirmPasswordRequired
        }

        if (value !== password) {
            return copy.form.validation.confirmPasswordMismatch
        }

        return undefined
    }

    function updateInputValue(
        field: AuthInputField,
        value: string,
        setter: React.Dispatch<React.SetStateAction<string>>,
    ) {
        markFieldChanged(field)
        setter(value)
    }

    function markFieldChanged(field: AuthInputField) {
        if (changedFieldsRef.current[field]) {
            return
        }

        changedFieldsRef.current = {
            ...changedFieldsRef.current,
            [field]: true,
        }
        setChangedFields((current) => ({ ...current, [field]: true }))
    }

    function markFieldBlurred(field: AuthInputField) {
        if (!changedFieldsRef.current[field]) {
            return
        }

        setBlurredFields((current) => ({ ...current, [field]: true }))
    }

    function resetFieldInteraction() {
        changedFieldsRef.current = {}
        setChangedFields({})
        setBlurredFields({})
    }

    function shouldShowFieldError(field: AuthInputField) {
        return Boolean(changedFields[field] && blurredFields[field])
    }

    function resolveShownFieldError(
        field: AuthInputField,
        submitError: string | undefined,
        currentError: string | undefined,
    ) {
        if (!submitError && !shouldShowFieldError(field)) {
            return undefined
        }

        return currentError
    }

    function getAccountCountryCode(value: string, countryCode: string) {
        return isPhoneAccountValue(value.trim()) ? countryCode : null
    }

    function isPhoneAccountValue(value: string) {
        return /^\d+$/.test(value)
    }

    const resendStatus = resendRemaining > 0
        ? copy.form.sentCountdown.replace("{seconds}", String(resendRemaining))
        : resendNotice

    const loginAccountError = resolveShownFieldError(
        "loginAccount",
        formErrors.account,
        validateAccountField(loginAccount, copy.form.validation.accountRequired),
    )
    const loginPasswordError = resolveShownFieldError(
        "loginPassword",
        formErrors.password,
        validateRequiredPasswordField(loginPassword),
    )
    const registerEmailError = resolveShownFieldError(
        "registerEmail",
        formErrors.account,
        validateEmailField(registerEmail, copy.form.validation.emailRequired),
    )
    const registerPasswordError = resolveShownFieldError(
        "registerPassword",
        formErrors.password,
        validatePasswordField(registerPassword),
    )
    const registerConfirmPasswordError = resolveShownFieldError(
        "registerConfirmPassword",
        formErrors.confirmPassword,
        validateConfirmPasswordField(registerConfirmPassword, registerPassword),
    )
    const recoveryAccountError = resolveShownFieldError(
        "recoveryAccount",
        formErrors.account,
        validateAccountField(recoveryAccount, copy.form.validation.accountRequired),
    )
    const newPasswordError = resolveShownFieldError(
        "newPassword",
        formErrors.password,
        validatePasswordField(newPassword),
    )
    const newConfirmPasswordError = resolveShownFieldError(
        "newConfirmPassword",
        formErrors.confirmPassword,
        validateConfirmPasswordField(newConfirmPassword, newPassword),
    )

    return (
        <LayoutGroup id="auth-page">
            <AuthPageShell copy={copy.shell}>
                <motion.div
                    key={`auth-flow-${flow}`}
                    className="flex w-full flex-col items-center gap-12"
                    initial={shouldReduceMotion ? false : "hidden"}
                    animate="visible"
                    variants={containerVariants}
                >
                    <AuthHeroText title={intro.title} subtitle={intro.subtitle} />

                    <AuthBlock
                        providers={authProviders}
                        separatorLabel={separatorLabel}
                    >
                        <AuthModePanelViewport shouldAnimateHeight={authModePanelTransition === "morph"}>
                            <AnimatePresence
                                initial={false}
                                mode="wait"
                                custom={authModePanelPresenceCustom}
                            >
                                {mode === "login" ? (
                                    <AuthModePanel key="login">
                                        <AuthEmailButton
                                            label={copy.login.continueWithEmail}
                                            disabled={isPending}
                                            onClick={() => switchToMode("login-email", "login")}
                                        />
                                    </AuthModePanel>
                                ) : null}

                                {mode === "register" ? (
                                    <AuthModePanel key="register">
                                        <AuthEmailButton
                                            label={copy.register.continueWithEmail}
                                            disabled={isPending}
                                            onClick={() => switchToMode("register-email", "register")}
                                        />
                                    </AuthModePanel>
                                ) : null}

                                {mode === "login-email" ? (
                                    <AuthModePanel key="login-email">
                                        <AuthEmailForm
                                            emailValue={loginAccount}
                                            onEmailValueChange={(value) => updateInputValue("loginAccount", value, setLoginAccount)}
                                            onEmailBlur={() => markFieldBlurred("loginAccount")}
                                            emailLabel={copy.form.labels.account}
                                            emailPlaceholder={copy.form.placeholders.account}
                                            emailInvalid={!!loginAccountError}
                                            emailError={loginAccountError}
                                            phoneCountryCodeValue={loginCountryCode}
                                            onPhoneCountryCodeValueChange={setLoginCountryCode}
                                            passwordValue={loginPassword}
                                            onPasswordValueChange={(value) => updateInputValue("loginPassword", value, setLoginPassword)}
                                            onPasswordBlur={() => markFieldBlurred("loginPassword")}
                                            passwordLabel={copy.form.labels.password}
                                            passwordPlaceholder={copy.form.placeholders.password}
                                            passwordInvalid={!!loginPasswordError}
                                            passwordError={loginPasswordError}
                                            forgotPasswordLabel={copy.form.actions.forgotPassword}
                                            forgotPasswordActionProps={{
                                                onClick: () => switchToMode("forgot", "forgot"),
                                            }}
                                            submitLabel={copy.form.buttons.signIn}
                                            submitButtonStatus={getButtonStatus("login")}
                                            showPasswordLabel={copy.form.actions.showPassword}
                                            hidePasswordLabel={copy.form.actions.hidePassword}
                                            disabled={isPending}
                                            onSubmit={submitLogin}
                                        />
                                    </AuthModePanel>
                                ) : null}

                                {mode === "register-email" ? (
                                    <AuthModePanel key="register-email">
                                        <AuthRegisterForm
                                            accountValue={registerEmail}
                                            onAccountValueChange={(value) => updateInputValue("registerEmail", value, setRegisterEmail)}
                                            onAccountBlur={() => markFieldBlurred("registerEmail")}
                                            accountLabel={copy.form.labels.email}
                                            accountPlaceholder={copy.form.placeholders.email}
                                            accountInvalid={!!registerEmailError}
                                            accountError={registerEmailError}
                                            passwordValue={registerPassword}
                                            onPasswordValueChange={(value) => updateInputValue("registerPassword", value, setRegisterPassword)}
                                            onPasswordBlur={() => markFieldBlurred("registerPassword")}
                                            passwordLabel={copy.form.labels.password}
                                            passwordPlaceholder={copy.form.placeholders.password}
                                            passwordInvalid={!!registerPasswordError}
                                            passwordError={registerPasswordError}
                                            confirmPasswordValue={registerConfirmPassword}
                                            onConfirmPasswordValueChange={(value) => updateInputValue("registerConfirmPassword", value, setRegisterConfirmPassword)}
                                            onConfirmPasswordBlur={() => markFieldBlurred("registerConfirmPassword")}
                                            confirmPasswordLabel={copy.form.labels.confirmPassword}
                                            confirmPasswordPlaceholder={copy.form.placeholders.password}
                                            confirmPasswordInvalid={!!registerConfirmPasswordError}
                                            confirmPasswordError={registerConfirmPasswordError}
                                            submitLabel={copy.form.buttons.signUp}
                                            submitButtonStatus={getButtonStatus("register")}
                                            showPasswordLabel={copy.form.actions.showPassword}
                                            hidePasswordLabel={copy.form.actions.hidePassword}
                                            disabled={isPending}
                                            onSubmit={submitRegister}
                                        />
                                    </AuthModePanel>
                                ) : null}

                                {mode === "verify" ? (
                                    <AuthModePanel key="verify">
                                        <AuthVerifyForm
                                            email={registerEmail}
                                            codeValue={verificationCode}
                                            onCodeValueChange={setVerificationCode}
                                            codeInvalid={!!formErrors.code}
                                            codeError={formErrors.code}
                                            sentToLabel={copy.form.labels.verificationSentTo}
                                            resendLabel={copy.form.resendPrompt}
                                            resendActionLabel={copy.form.resendAction}
                                            resendActionProps={{
                                                onClick: resendVerificationCode,
                                                disabled: isPending || resendRemaining > 0,
                                            }}
                                            resendButtonStatus={getButtonStatus("resend")}
                                            resendStatus={resendStatus}
                                            submitLabel={copy.form.buttons.verify}
                                            submitButtonStatus={getButtonStatus("verify")}
                                            disabled={pendingAction === "verify" || completedAction === "verify"}
                                            onSubmit={submitVerification}
                                        />
                                    </AuthModePanel>
                                ) : null}

                                {mode === "forgot" ? (
                                    <AuthModePanel key="forgot">
                                        <AuthEmailForm
                                            accountValueLayoutId={RECOVERY_ACCOUNT_LAYOUT_ID}
                                            emailValue={recoveryAccount}
                                            onEmailValueChange={(value) => updateInputValue("recoveryAccount", value, setRecoveryAccount)}
                                            onEmailBlur={() => markFieldBlurred("recoveryAccount")}
                                            emailLabel={copy.form.labels.account}
                                            emailPlaceholder={copy.form.placeholders.account}
                                            emailInvalid={!!recoveryAccountError}
                                            emailError={recoveryAccountError}
                                            phoneCountryCodeValue={recoveryCountryCode}
                                            onPhoneCountryCodeValueChange={setRecoveryCountryCode}
                                            submitLabel={copy.form.buttons.sendCode}
                                            submitButtonStatus={getButtonStatus("forgot")}
                                            showPasswordField={false}
                                            showSubmitIcon
                                            disabled={isPending}
                                            onSubmit={submitForgotPassword}
                                        />
                                    </AuthModePanel>
                                ) : null}

                                {mode === "reset" ? (
                                    <AuthModePanel key="reset">
                                        <AuthResetPasswordForm
                                            account={recoveryAccount}
                                            accountLayoutId={RECOVERY_ACCOUNT_LAYOUT_ID}
                                            codeValue={recoveryCode}
                                            onCodeValueChange={setRecoveryCode}
                                            codeLabel={copy.reset.codeLabel}
                                            codeInvalid={!!formErrors.code}
                                            codeError={formErrors.code}
                                            accountLabel={copy.reset.accountLabel}
                                            newPasswordValue={newPassword}
                                            onNewPasswordValueChange={(value) => updateInputValue("newPassword", value, setNewPassword)}
                                            onNewPasswordBlur={() => markFieldBlurred("newPassword")}
                                            newPasswordLabel={copy.form.labels.newPassword}
                                            newPasswordPlaceholder={copy.form.placeholders.password}
                                            newPasswordInvalid={!!newPasswordError}
                                            newPasswordError={newPasswordError}
                                            confirmPasswordValue={newConfirmPassword}
                                            onConfirmPasswordValueChange={(value) => updateInputValue("newConfirmPassword", value, setNewConfirmPassword)}
                                            onConfirmPasswordBlur={() => markFieldBlurred("newConfirmPassword")}
                                            confirmPasswordLabel={copy.form.labels.confirmPassword}
                                            confirmPasswordPlaceholder={copy.form.placeholders.password}
                                            confirmPasswordInvalid={!!newConfirmPasswordError}
                                            confirmPasswordError={newConfirmPasswordError}
                                            submitLabel={copy.form.buttons.resetPassword}
                                            submitButtonStatus={getButtonStatus("reset")}
                                            showPasswordLabel={copy.form.actions.showPassword}
                                            hidePasswordLabel={copy.form.actions.hidePassword}
                                            disabled={isPending}
                                            onSubmit={submitPasswordReset}
                                        />
                                    </AuthModePanel>
                                ) : null}

                                {mode === "success" ? (
                                    <AuthModePanel key="success">
                                        <AuthSuccess
                                            title={success.title}
                                            description={success.description}
                                        />
                                    </AuthModePanel>
                                ) : null}
                            </AnimatePresence>
                        </AuthModePanelViewport>
                    </AuthBlock>

                    <AuthFooterLink
                        key={`footer-${flow}`}
                        variants={itemVariants}
                        layout
                        label={isForgot ? copy.forgot.footerPrompt : isRegister ? copy.register.footerPrompt : copy.login.footerPrompt}
                        action={isForgot ? copy.forgot.footerAction : isRegister ? copy.register.footerAction : copy.login.footerAction}
                        actionProps={{
                            disabled: isPending,
                            onClick: () => {
                                if (isForgot) {
                                    switchToMode("login-email", "login")
                                    return
                                }

                                const nextFlow = isRegister ? "login" : "register"
                                switchToMode(nextFlow, nextFlow)
                            },
                        }}
                    />
                </motion.div>
            </AuthPageShell>
        </LayoutGroup>
    )
}

function AuthModePanelViewport({
                                   children,
                                   shouldAnimateHeight,
                               }: {
    children: React.ReactNode
    shouldAnimateHeight: boolean
}) {
    const shouldReduceMotion = useReducedMotion()
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [contentHeight, setContentHeight] = React.useState<number | null>(null)

    React.useLayoutEffect(() => {
        const element = contentRef.current

        if (!element) {
            return
        }

        const updateHeight = () => {
            setContentHeight(element.getBoundingClientRect().height)
        }

        updateHeight()

        const observer = new ResizeObserver(updateHeight)
        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    return (
        <motion.div
            className="w-full overflow-hidden"
            initial={false}
            animate={
                shouldAnimateHeight && contentHeight !== null
                    ? { height: contentHeight }
                    : { height: "auto" }
            }
            transition={{
                duration: shouldReduceMotion ? 0.12 : 0.3,
                ease: "easeOut",
            }}
        >
            <div ref={contentRef} className="w-full">
                {children}
            </div>
        </motion.div>
    )
}

function AuthModePanel({
                           children,
                       }: {
    children: React.ReactNode
}) {
    const shouldReduceMotion = useReducedMotion()
    const presenceCustom = usePresenceData() as AuthModePanelCustom | undefined

    return (
        <motion.div
            className="w-full overflow-visible"
            custom={{
                transition: presenceCustom?.transition ?? "morph",
                reducedMotion: !!shouldReduceMotion,
            } satisfies AuthModePanelCustom}
            variants={authModePanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
        >
            {children}
        </motion.div>
    )
}

function resolveAuthModePanelTransition(currentMode: AuthMode, nextMode: AuthMode): AuthModePanelTransition {
    return (
        (currentMode === "login" && nextMode === "login-email") ||
        (currentMode === "register" && nextMode === "register-email")
    )
        ? "expand"
        : "morph"
}

function hasErrors(errors: AuthFormErrors) {
    return Object.values(errors).some(Boolean)
}

function notifyRequestError(error: NormalizedClientError) {
    toast.error(error.message, {
        description: error.traceId ? `Trace ID: ${error.traceId}` : undefined,
    })
}

function waitForButtonSuccess() {
    return new Promise((resolve) => {
        window.setTimeout(resolve, BUTTON_SUCCESS_HOLD_MS)
    })
}

function resolveBrowserReturnTo() {
    if (typeof window === "undefined") {
        return null
    }

    const params = new URLSearchParams(window.location.search)
    const explicit = normalizeBrowserReturnTo(params.get("returnTo") ?? params.get("next"))
    if (explicit) {
        return explicit
    }

    return normalizeBrowserReturnTo(document.referrer)
}

function normalizeBrowserReturnTo(value: string | null) {
    if (!value) {
        return null
    }

    try {
        const target = new URL(value, window.location.origin)
        if (target.origin !== window.location.origin) {
            return null
        }

        if (target.pathname === window.location.pathname) {
            return null
        }

        if (target.pathname.endsWith("/auth")) {
            return null
        }

        return `${target.pathname}${target.search}${target.hash}`
    } catch {
        return null
    }
}
