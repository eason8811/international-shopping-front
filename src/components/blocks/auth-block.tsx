"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowRight, Check, Eye, EyeClosed, Mail } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { SiTiktok, SiX } from "react-icons/si"

import { cn } from "@/lib/utils"
import {
    getAuthFadeItemVariants,
    getAuthStaggerContainerVariants,
} from "@/components/blocks/auth-motion"
import { Button, type ButtonStatus } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type AuthProvider = "google" | "tiktok" | "x"

export interface AuthPhoneCountryOption {
    value: string
    label: string
}

export const defaultAuthPhoneCountryOptions: AuthPhoneCountryOption[] = [
    { value: "86", label: "+86 (CN)" },
    { value: "1", label: "+1 (US)" },
    { value: "44", label: "+44 (UK)" },
    { value: "81", label: "+81 (JP)" },
    { value: "82", label: "+82 (KR)" },
    { value: "49", label: "+49 (DE)" },
    { value: "33", label: "+33 (FR)" },
    { value: "34", label: "+34 (ES)" },
]

export interface AuthProviderAction {
    provider: AuthProvider
    label?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    status?: ButtonStatus
}

export const defaultAuthProviders: AuthProviderAction[] = [
    { provider: "google", label: "Continue with Google" },
    { provider: "tiktok", label: "Continue with TikTok" },
    { provider: "x", label: "Continue with X" },
]

export interface AuthBlockProps extends React.ComponentProps<typeof motion.section> {
    providers?: AuthProviderAction[]
    separatorLabel?: string
    footer?: React.ReactNode
    children: React.ReactNode
}

export interface AuthEmailButtonProps
    extends React.ComponentProps<typeof Button> {
    label?: string
}

export interface AuthEmailFormProps
    extends Omit<React.ComponentProps<typeof motion.form>, "children"> {
    accountValueLayoutId?: string
    emailValue?: string
    onEmailValueChange?: (value: string) => void
    emailLabel?: string
    emailPlaceholder?: string
    emailInvalid?: boolean
    emailError?: React.ReactNode
    onEmailBlur?: React.FocusEventHandler<HTMLInputElement>
    phoneCountryCodeValue?: string
    onPhoneCountryCodeValueChange?: (value: string) => void
    phoneCountryCodeLabel?: string
    phoneCountryOptions?: AuthPhoneCountryOption[]
    passwordValue?: string
    onPasswordValueChange?: (value: string) => void
    onPasswordBlur?: React.FocusEventHandler<HTMLInputElement>
    passwordLabel?: string
    passwordPlaceholder?: string
    passwordInvalid?: boolean
    passwordError?: React.ReactNode
    forgotPasswordLabel?: string
    forgotPasswordActionProps?: React.ComponentProps<typeof Button>
    submitLabel?: string
    submitButtonStatus?: ButtonStatus
    showPasswordField?: boolean
    showSubmitIcon?: boolean
    showPasswordLabel?: string
    hidePasswordLabel?: string
    disabled?: boolean
}

export interface AuthRegisterFormProps
    extends Omit<React.ComponentProps<typeof motion.form>, "children"> {
    accountValue?: string
    onAccountValueChange?: (value: string) => void
    accountLabel?: string
    accountPlaceholder?: string
    accountInvalid?: boolean
    accountError?: React.ReactNode
    onAccountBlur?: React.FocusEventHandler<HTMLInputElement>
    passwordValue?: string
    onPasswordValueChange?: (value: string) => void
    onPasswordBlur?: React.FocusEventHandler<HTMLInputElement>
    passwordLabel?: string
    passwordPlaceholder?: string
    passwordInvalid?: boolean
    passwordError?: React.ReactNode
    confirmPasswordValue?: string
    onConfirmPasswordValueChange?: (value: string) => void
    onConfirmPasswordBlur?: React.FocusEventHandler<HTMLInputElement>
    confirmPasswordLabel?: string
    confirmPasswordPlaceholder?: string
    confirmPasswordInvalid?: boolean
    confirmPasswordError?: React.ReactNode
    submitLabel?: string
    submitButtonStatus?: ButtonStatus
    showPasswordLabel?: string
    hidePasswordLabel?: string
    disabled?: boolean
}

export interface AuthVerifyFormProps
    extends Omit<React.ComponentProps<typeof motion.form>, "children"> {
    email: string
    codeValue?: string
    onCodeValueChange?: (value: string) => void
    codeLength?: number
    codeInvalid?: boolean
    codeError?: React.ReactNode
    sentToLabel?: string
    resendLabel?: string
    resendActionLabel?: string
    resendActionProps?: React.ComponentProps<typeof Button>
    resendButtonStatus?: ButtonStatus
    resendStatus?: React.ReactNode
    submitLabel?: string
    submitButtonStatus?: ButtonStatus
    disabled?: boolean
}

export interface AuthResetPasswordFormProps
    extends Omit<React.ComponentProps<typeof motion.form>, "children"> {
    account: string
    accountLayoutId?: string
    codeValue?: string
    onCodeValueChange?: (value: string) => void
    codeLength?: number
    codeLabel?: string
    codeInvalid?: boolean
    codeError?: React.ReactNode
    accountLabel?: string
    newPasswordValue?: string
    onNewPasswordValueChange?: (value: string) => void
    onNewPasswordBlur?: React.FocusEventHandler<HTMLInputElement>
    newPasswordLabel?: string
    newPasswordPlaceholder?: string
    newPasswordInvalid?: boolean
    newPasswordError?: React.ReactNode
    confirmPasswordValue?: string
    onConfirmPasswordValueChange?: (value: string) => void
    onConfirmPasswordBlur?: React.FocusEventHandler<HTMLInputElement>
    confirmPasswordLabel?: string
    confirmPasswordPlaceholder?: string
    confirmPasswordInvalid?: boolean
    confirmPasswordError?: React.ReactNode
    submitLabel?: string
    submitButtonStatus?: ButtonStatus
    showPasswordLabel?: string
    hidePasswordLabel?: string
    disabled?: boolean
}

export interface AuthSuccessProps extends React.ComponentProps<"div"> {
    title?: string
    description?: string
}

function AuthProviderIcon({ provider }: { provider: AuthProvider }) {
    if (provider === "google") {
        return <FcGoogle data-icon="inline-start" />
    }

    if (provider === "tiktok") {
        return <SiTiktok data-icon="inline-start" />
    }

    return <SiX data-icon="inline-start" />
}

function getAuthProviderLabel(provider: AuthProvider) {
    if (provider === "google") {
        return "Continue with Google"
    }

    if (provider === "tiktok") {
        return "Continue with TikTok"
    }

    return "Continue with X"
}

export function AuthProviderButton({
                                       provider,
                                       label,
                                       className,
                                       ...props
                                   }: AuthProviderAction & { className?: string }) {
    return (
        <Button
            type="button"
            size="social"
            className={cn("w-full justify-center", className)}
            {...props}
        >
            <AuthProviderIcon provider={provider} />
            {label ?? getAuthProviderLabel(provider)}
        </Button>
    )
}

export function AuthEmailButton({
                                    label = "Continue with Email",
                                    className,
                                    ...props
                                }: AuthEmailButtonProps) {
    return (
        <Button
            type="button"
            variant="secondary"
            size="email"
            className={cn("w-full justify-center", className)}
            {...props}
        >
            <Mail data-icon="inline-start" />
            {label}
        </Button>
    )
}

export function AuthSeparator({ children = "or" }: { children?: React.ReactNode }) {
    return <FieldSeparator>{children}</FieldSeparator>
}

export function AuthBlock({
                              providers = defaultAuthProviders,
                              separatorLabel = "or",
                              footer,
                              children,
                              className,
                              ...props
                          }: AuthBlockProps) {
    const hasProviders = providers.length > 0
    const shouldReduceMotion = useReducedMotion()
    const itemVariants = getAuthFadeItemVariants(!!shouldReduceMotion)
    const containerVariants = getAuthStaggerContainerVariants(!!shouldReduceMotion)

    return (
        <motion.section
            data-slot="auth-block"
            className={cn("flex w-full flex-col gap-4", className)}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={itemVariants}
            {...props}
        >
            {hasProviders ? (
                <motion.div className="flex w-full flex-col gap-4" variants={containerVariants}>
                    <FieldGroup className="gap-3">
                        {providers.map((provider) => (
                            <motion.div key={provider.provider} variants={itemVariants}>
                                <AuthProviderButton {...provider} />
                            </motion.div>
                        ))}
                    </FieldGroup>
                    <motion.div variants={itemVariants}>
                        <AuthSeparator>{separatorLabel}</AuthSeparator>
                    </motion.div>
                </motion.div>
            ) : null}
            {children}
            {footer ? (
                <motion.div className="pt-1" variants={itemVariants}>
                    {footer}
                </motion.div>
            ) : null}
        </motion.section>
    )
}

export function AuthFooterLink({
                                   label,
                                   action,
                               actionProps,
                               className,
                               ...props
                           }: React.ComponentProps<typeof motion.p> & {
    label: string
    action: React.ReactNode
    actionProps?: React.ComponentProps<typeof Button>
}) {
    const { className: actionClassName, ...buttonProps } = actionProps ?? {}
    const shouldReduceMotion = useReducedMotion()

    return (
        <motion.p
            className={cn(
                "text-center text-xs leading-4 font-medium tracking-[0.6px] text-auth-muted",
                "font-normal tracking-[0.3px]",
                className
            )}
            variants={getAuthFadeItemVariants(!!shouldReduceMotion)}
            {...props}
        >
            {label}{" "}
            <Button
                type="button"
                variant="link"
                size="link"
                className={cn(
                    "inline-flex border-b border-auth-ink/0 border-dashed hover:border-auth-ink px-0.5 pb-px align-baseline text-xs leading-4 font-bold tracking-[0.3px] text-auth-ink uppercase no-underline hover:no-underline",
                    actionClassName
                )}
                {...buttonProps}
            >
                {action}
            </Button>
        </motion.p>
    )
}

export function AuthEmailForm({
                                  accountValueLayoutId,
                                  emailValue,
                                  onEmailValueChange,
                                  emailLabel = "Account",
                                  emailPlaceholder = "Email address or phone number",
                                  emailInvalid,
                                  emailError,
                                  onEmailBlur,
                                  phoneCountryCodeValue,
                                  onPhoneCountryCodeValueChange,
                                  phoneCountryCodeLabel = "Phone country code",
                                  phoneCountryOptions = defaultAuthPhoneCountryOptions,
                                  passwordValue,
                                  onPasswordValueChange,
                                  onPasswordBlur,
                                  passwordLabel = "Secret Key",
                                  passwordPlaceholder = "••••••••",
                                  passwordInvalid,
                                  passwordError,
                                  forgotPasswordLabel = "Forgot Password",
                                  forgotPasswordActionProps,
                                  submitLabel = "Sign In",
                                  submitButtonStatus = "idle",
                                  showPasswordField = true,
                                  showSubmitIcon = true,
                                  showPasswordLabel,
                                  hidePasswordLabel,
                                  disabled,
                                  className,
                                  ...props
                              }: AuthEmailFormProps) {
    const emailId = React.useId()
    const passwordId = React.useId()
    const [internalPhoneCountryCode, setInternalPhoneCountryCode] = React.useState(
        phoneCountryOptions[0]?.value ?? "86"
    )
    const shouldReduceMotion = useReducedMotion()
    const itemVariants = getAuthFadeItemVariants(!!shouldReduceMotion)
    const containerVariants = getAuthStaggerContainerVariants(!!shouldReduceMotion)
    const isPhoneVariant = isNumericAccountValue(emailValue)
    const resolvedPhoneCountryCodeValue = phoneCountryCodeValue ?? internalPhoneCountryCode

    function handlePhoneCountryCodeValueChange(value: string) {
        setInternalPhoneCountryCode(value)
        onPhoneCountryCodeValueChange?.(value)
    }

    return (
        <motion.form
            noValidate
            className={cn("flex w-full flex-col gap-8", className)}
            variants={containerVariants}
            {...props}
        >
            <FieldGroup className="gap-5">
                <motion.div className="w-full" variants={itemVariants}>
                    <AuthAccountField
                        id={emailId}
                        label={emailLabel}
                        placeholder={emailPlaceholder}
                        value={emailValue}
                        onValueChange={onEmailValueChange}
                        onBlur={onEmailBlur}
                        invalid={emailInvalid}
                        error={emailError}
                        disabled={disabled}
                        phoneCountryCodeValue={resolvedPhoneCountryCodeValue}
                        onPhoneCountryCodeValueChange={handlePhoneCountryCodeValueChange}
                        phoneCountryCodeLabel={phoneCountryCodeLabel}
                        phoneCountryOptions={phoneCountryOptions}
                        phoneVariant={isPhoneVariant}
                        valueLayoutId={accountValueLayoutId}
                    />
                </motion.div>

                {showPasswordField ? (
                    <motion.div className="w-full" variants={itemVariants}>
                        <AuthPasswordField
                            id={passwordId}
                            label={passwordLabel}
                            placeholder={passwordPlaceholder}
                            invalid={passwordInvalid}
                            error={passwordError}
                            action={forgotPasswordLabel}
                            actionProps={forgotPasswordActionProps}
                            value={passwordValue}
                            onValueChange={onPasswordValueChange}
                            onBlur={onPasswordBlur}
                            showPasswordLabel={showPasswordLabel}
                            hidePasswordLabel={hidePasswordLabel}
                            disabled={disabled}
                        />
                    </motion.div>
                ) : null}
            </FieldGroup>

            <motion.div variants={itemVariants}>
                <Button
                    type="submit"
                    size="email"
                    className="w-full font-semibold tracking-[0.35px]"
                    disabled={disabled}
                    status={submitButtonStatus}
                >
                    {submitLabel}
                    {showSubmitIcon ? <ArrowRight data-icon="inline-end" /> : null}
                </Button>
            </motion.div>
        </motion.form>
    )
}

function AuthAccountField({
                              id,
                              label,
                              placeholder,
                              value,
                              onValueChange,
                              onBlur,
                              invalid,
                              error,
                              disabled,
                              phoneCountryCodeValue,
                              onPhoneCountryCodeValueChange,
                              phoneCountryCodeLabel,
                              phoneCountryOptions,
                              phoneVariant,
                              valueLayoutId,
                          }: {
    id: string
    label: string
    placeholder: string
    value?: string
    onValueChange?: (value: string) => void
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    invalid?: boolean
    error?: React.ReactNode
    disabled?: boolean
    phoneCountryCodeValue: string
    onPhoneCountryCodeValueChange?: (value: string) => void
    phoneCountryCodeLabel: string
    phoneCountryOptions: AuthPhoneCountryOption[]
    phoneVariant: boolean
    valueLayoutId?: string
}) {
    const shouldReduceMotion = useReducedMotion()

    return (
        <Field
            data-invalid={invalid || undefined}
            data-disabled={disabled || undefined}
            data-account-variant={phoneVariant ? "phone" : "email"}
        >
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <div
                className={cn(
                    "flex w-full items-center justify-center overflow-hidden border-b border-auth-input-border pt-3.25 pb-3.5 transition-[border-color,box-shadow,opacity] duration-(--motion-duration-medium) ease-(--motion-ease-standard) focus-within:border-auth-ink",
                    invalid && "border-status-danger/30 focus-within:border-status-danger",
                )}
            >
                <AnimatePresence initial={false}>
                    {phoneVariant ? (
                        <motion.div
                            key="phone-country-select"
                            className="flex shrink-0 items-center gap-3 overflow-hidden"
                            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, width: 0 }}
                            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, width: "auto" }}
                            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, width: 0 }}
                            transition={{
                                duration: shouldReduceMotion ? 0.1 : 0.22,
                                ease: [0.2, 0.8, 0.2, 1],
                            }}
                        >
                            <AuthPhoneCountrySelect
                                value={phoneCountryCodeValue}
                                onValueChange={onPhoneCountryCodeValueChange}
                                label={phoneCountryCodeLabel}
                                options={phoneCountryOptions}
                                disabled={disabled}
                            />
                            <div className="w-px self-stretch bg-auth-muted/10" aria-hidden="true" />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
                <motion.div
                    className={cn("min-w-0 flex-1", phoneVariant && "pl-3")}
                    layoutId={valueLayoutId}
                    transition={{
                        duration: shouldReduceMotion ? 0.1 : 0.28,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    <Input
                        id={id}
                        type="text"
                        autoComplete="username"
                        inputMode={phoneVariant ? "numeric" : "email"}
                        value={value}
                        onChange={(event) => onValueChange?.(event.target.value)}
                        onBlur={onBlur}
                        aria-invalid={invalid || undefined}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="h-6 border-b-0 px-0 pt-0 pb-0 leading-6 focus-visible:border-transparent"
                    />
                </motion.div>
            </div>
            <FieldError>{error}</FieldError>
        </Field>
    )
}

function AuthPhoneCountrySelect({
                                    value,
                                    onValueChange,
                                    label,
                                    options,
                                    disabled,
                                }: {
    value: string
    onValueChange?: (value: string) => void
    label: string
    options: AuthPhoneCountryOption[]
    disabled?: boolean
}) {
    const selectedOption = options.find((option) => option.value === value)

    return (
        <Select
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
        >
            <SelectTrigger
                size="sm"
                aria-label={label}
                className="h-6 w-fit gap-2 rounded-none border-0 bg-transparent px-0 py-0 text-base leading-6 font-normal text-auth-placeholder shadow-none hover:cursor-pointer focus-visible:border-transparent focus-visible:ring-0 data-[size=sm]:h-6 disabled:cursor-not-allowed [&_svg]:text-auth-placeholder"
            >
                <SelectValue placeholder={selectedOption?.label} />
            </SelectTrigger>
            <SelectContent align="start" className="min-w-36">
                <SelectGroup>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

function isNumericAccountValue(value: string | undefined) {
    return /^\d+$/.test(value ?? "")
}

export function AuthRegisterForm({
                                     accountValue,
                                     onAccountValueChange,
                                     accountLabel = "Account",
                                     accountPlaceholder = "Email address or phone number",
                                     accountInvalid,
                                     accountError,
                                     onAccountBlur,
                                     passwordValue,
                                     onPasswordValueChange,
                                     onPasswordBlur,
                                     passwordLabel = "Secret Key",
                                     passwordPlaceholder = "••••••••",
                                     passwordInvalid,
                                     passwordError,
                                     confirmPasswordValue,
                                     onConfirmPasswordValueChange,
                                     onConfirmPasswordBlur,
                                     confirmPasswordLabel = "Confirm Secret Key",
                                     confirmPasswordPlaceholder = "••••••••",
                                     confirmPasswordInvalid,
                                     confirmPasswordError,
                                     submitLabel = "Sign Up",
                                     submitButtonStatus = "idle",
                                     showPasswordLabel,
                                     hidePasswordLabel,
                                     disabled,
                                     className,
                                     ...props
                                 }: AuthRegisterFormProps) {
    const accountId = React.useId()
    const passwordId = React.useId()
    const confirmPasswordId = React.useId()
    const shouldReduceMotion = useReducedMotion()
    const itemVariants = getAuthFadeItemVariants(!!shouldReduceMotion)
    const containerVariants = getAuthStaggerContainerVariants(!!shouldReduceMotion)

    return (
        <motion.form
            noValidate
            className={cn("flex w-full flex-col gap-8", className)}
            variants={containerVariants}
            {...props}
        >
            <FieldGroup className="gap-2.5">
                <motion.div className="w-full" variants={itemVariants}>
                    <Field data-invalid={accountInvalid || undefined}>
                        <FieldLabel htmlFor={accountId}>{accountLabel}</FieldLabel>
                        <Input
                            id={accountId}
                            type="email"
                            autoComplete="email"
                            value={accountValue}
                            onChange={(event) => onAccountValueChange?.(event.target.value)}
                            onBlur={onAccountBlur}
                            aria-invalid={accountInvalid || undefined}
                            placeholder={accountPlaceholder}
                            disabled={disabled}
                        />
                        <FieldError>{accountError}</FieldError>
                    </Field>
                </motion.div>

                <motion.div className="w-full" variants={itemVariants}>
                    <AuthPasswordField
                        id={passwordId}
                        label={passwordLabel}
                        placeholder={passwordPlaceholder}
                        invalid={passwordInvalid}
                        error={passwordError}
                        action={null}
                        value={passwordValue}
                        onValueChange={onPasswordValueChange}
                        onBlur={onPasswordBlur}
                        autoComplete="new-password"
                        showPasswordLabel={showPasswordLabel}
                        hidePasswordLabel={hidePasswordLabel}
                        disabled={disabled}
                    />
                </motion.div>

                <motion.div className="w-full" variants={itemVariants}>
                    <AuthPasswordField
                        id={confirmPasswordId}
                        label={confirmPasswordLabel}
                        placeholder={confirmPasswordPlaceholder}
                        invalid={confirmPasswordInvalid}
                        error={confirmPasswordError}
                        action={null}
                        value={confirmPasswordValue}
                        onValueChange={onConfirmPasswordValueChange}
                        onBlur={onConfirmPasswordBlur}
                        autoComplete="new-password"
                        showPasswordLabel={showPasswordLabel}
                        hidePasswordLabel={hidePasswordLabel}
                        disabled={disabled}
                    />
                </motion.div>
            </FieldGroup>

            <motion.div variants={itemVariants}>
                <Button
                    type="submit"
                    size="email"
                    className="w-full font-semibold tracking-[0.35px]"
                    disabled={disabled}
                    status={submitButtonStatus}
                >
                    {submitLabel}
                    <ArrowRight data-icon="inline-end" />
                </Button>
            </motion.div>
        </motion.form>
    )
}

export function AuthPasswordField({
                                      id,
                                      label = "Secret Key",
                                      placeholder = "••••••••",
                                      invalid,
                                      error,
                                      action = "Forgot Password",
                                      actionProps,
                                      value,
                                      onValueChange,
                                      onBlur,
                                      autoComplete = "current-password",
                                      showPasswordLabel = "Show password",
                                      hidePasswordLabel = "Hide password",
                                      disabled,
                                  }: {
    id?: string
    label?: string
    placeholder?: string
    invalid?: boolean
    error?: React.ReactNode
    action?: React.ReactNode
    actionProps?: React.ComponentProps<typeof Button>
    value?: string
    onValueChange?: (value: string) => void
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    autoComplete?: React.ComponentProps<"input">["autoComplete"]
    showPasswordLabel?: string
    hidePasswordLabel?: string
    disabled?: boolean
}) {
    const fallbackId = React.useId()
    const passwordId = id ?? fallbackId
    const [isVisible, setIsVisible] = React.useState(false)
    const {
        className: actionClassName,
        disabled: actionDisabled,
        ...resolvedActionProps
    } = actionProps ?? {}
    const toggleLabel = isVisible ? hidePasswordLabel : showPasswordLabel
    const shouldReduceMotion = useReducedMotion()

    return (
        <Field data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
            <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor={passwordId}>{label}</FieldLabel>
                {action ? (
                    <Button
                        type="button"
                        variant="ghost-bare"
                        size="bare"
                        className={cn(
                            "text-[10px] leading-3.75 font-semibold tracking-[0.5px] uppercase",
                            actionClassName
                        )}
                        disabled={disabled || actionDisabled}
                        {...resolvedActionProps}
                    >
                        {action}
                    </Button>
                ) : null}
            </div>
            <div className="relative">
                <Input
                    id={passwordId}
                    type={isVisible ? "text" : "password"}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={(event) => onValueChange?.(event.target.value)}
                    onBlur={onBlur}
                    aria-invalid={invalid || undefined}
                    placeholder={placeholder}
                    className="pr-8"
                    disabled={disabled}
                />
                <Button
                    type="button"
                    variant="ghost-bare"
                    size="icon-bare-sm"
                    aria-label={toggleLabel}
                    className="absolute top-1/2 right-0 -translate-y-1/2"
                    onClick={() => setIsVisible((current) => !current)}
                    disabled={disabled}
                >
                    <span className="relative flex size-4 items-center justify-center">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.span
                                key={isVisible ? "visible" : "hidden"}
                                className="absolute inset-0 flex items-center justify-center"
                                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                                transition={{
                                    duration: shouldReduceMotion ? 0.1 : 0.16,
                                    ease: [0.2, 0.8, 0.2, 1],
                                }}
                            >
                                {isVisible ? (
                                    <Eye data-icon="inline-start" aria-hidden="true" />
                                ) : (
                                    <EyeClosed data-icon="inline-start" aria-hidden="true" />
                                )}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                </Button>
            </div>
            <FieldError>{error}</FieldError>
        </Field>
    )
}

export function AuthVerifyForm({
                                   email,
                                   codeValue,
                                   onCodeValueChange,
                                   codeLength = 6,
                                   codeInvalid,
                                   codeError,
                                   sentToLabel = "Verification code sent to",
                                   resendLabel = "Didn't receive the code?",
                                   resendActionLabel = "Resend",
                                   resendActionProps,
                                   resendButtonStatus = "idle",
                                   resendStatus,
                                   submitLabel = "Verify",
                                   submitButtonStatus = "idle",
                                   disabled,
                                   className,
                                   ...props
                               }: AuthVerifyFormProps) {
    const shouldReduceMotion = useReducedMotion()
    const itemVariants = getAuthFadeItemVariants(!!shouldReduceMotion)
    const containerVariants = getAuthStaggerContainerVariants(!!shouldReduceMotion)
    const {
        className: resendActionClassName,
        disabled: resendActionDisabled,
        ...resolvedResendActionProps
    } = resendActionProps ?? {}

    return (
        <motion.form
            noValidate
            className={cn("flex w-full flex-col gap-8", className)}
            variants={containerVariants}
            {...props}
        >
            <motion.div
                className="flex w-full flex-col items-center justify-center gap-2 overflow-hidden text-center"
                variants={itemVariants}
            >
                <FieldDescription className="text-center capitalize">
                    {sentToLabel}
                </FieldDescription>
                <p className="text-sm leading-5 font-medium tracking-[0.7px] text-auth-ink">
                    {email}
                </p>
            </motion.div>

            <motion.div variants={itemVariants}>
                <AuthCodeField
                    value={codeValue}
                    onValueChange={onCodeValueChange}
                    codeLength={codeLength}
                    ariaLabel={`Verification code for ${email}`}
                    invalid={codeInvalid}
                    error={codeError}
                    disabled={disabled}
                />
            </motion.div>

            <motion.p
                className="text-center text-sm leading-5 font-medium tracking-[0.7px] text-auth-muted"
                variants={itemVariants}
            >
                {resendLabel}{" "}
                <Button
                    type="button"
                    variant="link"
                    size="link"
                    className={cn(
                        "inline-flex border-b border-dashed border-auth-ink px-0.5 pb-px align-baseline text-sm leading-5 font-medium tracking-[0.7px] text-auth-ink no-underline hover:no-underline",
                        resendActionClassName
                    )}
                    disabled={disabled || resendActionDisabled}
                    status={resendButtonStatus}
                    {...resolvedResendActionProps}
                >
                    {resendActionLabel}
                </Button>
            </motion.p>

            <AnimatePresence initial={false}>
                {resendStatus ? (
                    <motion.div
                        key="resend-status"
                        variants={itemVariants}
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto", y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
                        transition={{
                            duration: shouldReduceMotion ? 0.1 : 0.2,
                            ease: [0.2, 0.8, 0.2, 1],
                        }}
                    >
                        <FieldDescription className="text-center text-xs leading-4">
                            {resendStatus}
                        </FieldDescription>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <motion.div variants={itemVariants}>
                <Button
                    type="submit"
                    size="email"
                    className="w-full font-semibold tracking-[0.35px]"
                    disabled={disabled}
                    status={submitButtonStatus}
                >
                    {submitLabel}
                </Button>
            </motion.div>
        </motion.form>
    )
}

export function AuthResetPasswordForm({
                                          account,
                                          accountLayoutId,
                                          codeValue,
                                          onCodeValueChange,
                                          codeLength = 6,
                                          codeLabel = "Verification code",
                                          codeInvalid,
                                          codeError,
                                          accountLabel = "Account in recovery",
                                          newPasswordValue,
                                          onNewPasswordValueChange,
                                          onNewPasswordBlur,
                                          newPasswordLabel = "New Password",
                                          newPasswordPlaceholder = "••••••••",
                                          newPasswordInvalid,
                                          newPasswordError,
                                          confirmPasswordValue,
                                          onConfirmPasswordValueChange,
                                          onConfirmPasswordBlur,
                                          confirmPasswordLabel = "Confirm Secret Key",
                                          confirmPasswordPlaceholder = "••••••••",
                                          confirmPasswordInvalid,
                                          confirmPasswordError,
                                          submitLabel = "Reset Password",
                                          submitButtonStatus = "idle",
                                          showPasswordLabel,
                                          hidePasswordLabel,
                                          disabled,
                                          className,
                                          ...props
                                      }: AuthResetPasswordFormProps) {
    const shouldReduceMotion = useReducedMotion()
    const itemVariants = getAuthFadeItemVariants(!!shouldReduceMotion)
    const containerVariants = getAuthStaggerContainerVariants(!!shouldReduceMotion)

    return (
        <motion.form
            noValidate
            className={cn("flex w-full flex-col gap-8", className)}
            variants={containerVariants}
            {...props}
        >
            <motion.div
                className="flex w-full flex-col items-center justify-center gap-2 overflow-hidden text-center"
                variants={itemVariants}
            >
                <FieldDescription className="text-center capitalize">
                    {accountLabel}
                </FieldDescription>
                <motion.p
                    className="text-sm leading-5 font-medium tracking-[0.7px] text-auth-ink"
                    layoutId={accountLayoutId}
                    transition={{
                        duration: shouldReduceMotion ? 0.1 : 0.28,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    {account}
                </motion.p>
            </motion.div>

            <FieldGroup className="gap-5">
                <motion.div className="w-full" variants={itemVariants}>
                    <AuthCodeField
                        label={codeLabel}
                        value={codeValue}
                        onValueChange={onCodeValueChange}
                        codeLength={codeLength}
                        ariaLabel={codeLabel}
                        invalid={codeInvalid}
                        error={codeError}
                        disabled={disabled}
                    />
                </motion.div>

                <motion.div className="w-full" variants={itemVariants}>
                    <AuthPasswordField
                        label={newPasswordLabel}
                        placeholder={newPasswordPlaceholder}
                        invalid={newPasswordInvalid}
                        error={newPasswordError}
                        action={null}
                        value={newPasswordValue}
                        onValueChange={onNewPasswordValueChange}
                        onBlur={onNewPasswordBlur}
                        autoComplete="new-password"
                        showPasswordLabel={showPasswordLabel}
                        hidePasswordLabel={hidePasswordLabel}
                        disabled={disabled}
                    />
                </motion.div>

                <motion.div className="w-full" variants={itemVariants}>
                    <AuthPasswordField
                        label={confirmPasswordLabel}
                        placeholder={confirmPasswordPlaceholder}
                        invalid={confirmPasswordInvalid}
                        error={confirmPasswordError}
                        action={null}
                        value={confirmPasswordValue}
                        onValueChange={onConfirmPasswordValueChange}
                        onBlur={onConfirmPasswordBlur}
                        autoComplete="new-password"
                        showPasswordLabel={showPasswordLabel}
                        hidePasswordLabel={hidePasswordLabel}
                        disabled={disabled}
                    />
                </motion.div>
            </FieldGroup>

            <motion.div variants={itemVariants}>
                <Button
                    type="submit"
                    size="email"
                    className="w-full font-semibold tracking-[0.35px]"
                    disabled={disabled}
                    status={submitButtonStatus}
                >
                    {submitLabel}
                </Button>
            </motion.div>
        </motion.form>
    )
}

function AuthCodeField({
                           label,
                           value,
                           onValueChange,
                           codeLength,
                           ariaLabel,
                           invalid,
                           error,
                           disabled,
                       }: {
    label?: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
    codeLength: number
    ariaLabel: string
    invalid?: boolean
    error?: React.ReactNode
    disabled?: boolean
}) {
    const midpoint = Math.ceil(codeLength / 2)
    const slots = Array.from({ length: codeLength }, (_, index) => index)

    return (
        <Field data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
            {label ? <FieldLabel>{label}</FieldLabel> : null}
            <InputOTP
                maxLength={codeLength}
                aria-label={ariaLabel}
                value={value}
                onChange={onValueChange}
                disabled={disabled}
            >
                <div className="flex w-full items-center justify-center gap-3">
                    <InputOTPGroup aria-invalid={invalid || undefined}>
                        {slots.slice(0, midpoint).map((slot) => (
                            <InputOTPSlot key={slot} index={slot} />
                        ))}
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup aria-invalid={invalid || undefined}>
                        {slots.slice(midpoint).map((slot) => (
                            <InputOTPSlot key={slot} index={slot} />
                        ))}
                    </InputOTPGroup>
                </div>
            </InputOTP>
            <FieldError>{error}</FieldError>
        </Field>
    )
}

export function AuthSuccess({
                                title = "Successful",
                                description = "Your account has been created and verified.",
                                className,
                                ...props
                            }: AuthSuccessProps) {
    const shouldReduceMotion = useReducedMotion()

    return (
        <div
            className={cn("flex w-full flex-col items-center gap-6 text-center", className)}
            {...props}
        >
            <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                    shouldReduceMotion
                        ? { duration: 0.12, ease: [0.2, 0.8, 0.2, 1] }
                        : { type: "spring", stiffness: 260, damping: 20 }
                }
                className="flex size-16 items-center justify-center rounded-full bg-auth-success-surface"
            >
                <div className="flex size-10 items-center justify-center rounded-full bg-auth-success text-white">
                    <Check className="size-6" />
                </div>
            </motion.div>

            <div className="flex max-w-70 flex-col gap-2">
                <h3 className="text-2xl leading-8 font-semibold tracking-[-0.6px] text-auth-ink">
                    {title}
                </h3>
                <p className="text-sm leading-[22.75px] font-normal text-auth-muted">
                    {description}
                </p>
            </div>
        </div>
    )
}
