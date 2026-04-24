"use client"

import * as React from "react"
import { motion } from "motion/react"
import { ArrowRight, Check, Eye, Mail } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { SiTiktok, SiX } from "react-icons/si"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

export type AuthProvider = "google" | "tiktok" | "x"

export interface AuthProviderAction {
    provider: AuthProvider
    label?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const defaultAuthProviders: AuthProviderAction[] = [
    { provider: "google", label: "Continue With Google" },
    { provider: "tiktok", label: "Continue With TikTok" },
    { provider: "x", label: "Continue With X" },
]

export interface AuthBlockProps extends React.ComponentProps<"section"> {
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
    extends Omit<React.ComponentProps<"form">, "children"> {
    emailLabel?: string
    emailPlaceholder?: string
    emailInvalid?: boolean
    emailError?: React.ReactNode
    passwordLabel?: string
    passwordPlaceholder?: string
    passwordInvalid?: boolean
    passwordError?: React.ReactNode
    forgotPasswordLabel?: string
    submitLabel?: string
    showPasswordField?: boolean
}

export interface AuthVerifyFormProps
    extends Omit<React.ComponentProps<"form">, "children"> {
    email: string
    codeLength?: number
    resendLabel?: string
    resendActionLabel?: string
    submitLabel?: string
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
        return "Continue With Google"
    }

    if (provider === "tiktok") {
        return "Continue With TikTok"
    }

    return "Continue With X"
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
                                    label = "Continue With Email",
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

    return (
        <section
            data-slot="auth-block"
            className={cn("flex w-full flex-col gap-4", className)}
            {...props}
        >
            {hasProviders ? (
                <>
                    <FieldGroup className="gap-3">
                        {providers.map((provider) => (
                            <AuthProviderButton key={provider.provider} {...provider} />
                        ))}
                    </FieldGroup>
                    <AuthSeparator>{separatorLabel}</AuthSeparator>
                </>
            ) : null}
            {children}
            {footer ? <div className="pt-1">{footer}</div> : null}
        </section>
    )
}

export function AuthFooterLink({
                                   label,
                                   action,
                                   actionProps,
                                   className,
                                   ...props
                               }: React.ComponentProps<"p"> & {
    label: string
    action: React.ReactNode
    actionProps?: React.ComponentProps<typeof Button>
}) {
    const { className: actionClassName, ...buttonProps } = actionProps ?? {}

    return (
        <p
            className={cn(
                "text-center text-xs leading-4 font-medium tracking-[0.6px] text-auth-muted",
                className
            )}
            {...props}
        >
            {label}{" "}
            <Button
                type="button"
                variant="link"
                size="link"
                className={cn(
                    "inline-flex border-b border-dashed border-auth-ink px-0.5 pb-px align-baseline text-xs leading-4 font-bold tracking-[0.3px] text-auth-ink uppercase no-underline hover:no-underline",
                    actionClassName
                )}
                {...buttonProps}
            >
                {action}
            </Button>
        </p>
    )
}

export function AuthEmailForm({
                                  emailLabel = "Email Address",
                                  emailPlaceholder = "Enter your email",
                                  emailInvalid,
                                  emailError,
                                  passwordLabel = "Secret Key",
                                  passwordPlaceholder = "Enter your password",
                                  passwordInvalid,
                                  passwordError,
                                  forgotPasswordLabel = "Forgot Password",
                                  submitLabel = "Sign In",
                                  showPasswordField = true,
                                  className,
                                  ...props
                              }: AuthEmailFormProps) {
    const emailId = React.useId()
    const passwordId = React.useId()

    return (
        <form className={cn("flex w-full flex-col gap-8", className)} {...props}>
            <FieldGroup className="gap-5">
                <Field data-invalid={emailInvalid || undefined}>
                    <FieldLabel htmlFor={emailId}>{emailLabel}</FieldLabel>
                    <Input
                        id={emailId}
                        type="email"
                        autoComplete="email"
                        aria-invalid={emailInvalid || undefined}
                        placeholder={emailPlaceholder}
                    />
                    {emailError ? <FieldError>{emailError}</FieldError> : null}
                </Field>

                {showPasswordField ? (
                    <AuthPasswordField
                        id={passwordId}
                        label={passwordLabel}
                        placeholder={passwordPlaceholder}
                        invalid={passwordInvalid}
                        error={passwordError}
                        action={forgotPasswordLabel}
                    />
                ) : null}
            </FieldGroup>

            <Button type="submit" size="email" className="w-full font-semibold tracking-[0.35px]">
                {submitLabel}
                <ArrowRight data-icon="inline-end" />
            </Button>
        </form>
    )
}

export function AuthPasswordField({
                                      id,
                                      label = "Secret Key",
                                      placeholder = "Enter your password",
                                      invalid,
                                      error,
                                      action = "Forgot Password",
                                  }: {
    id?: string
    label?: string
    placeholder?: string
    invalid?: boolean
    error?: React.ReactNode
    action?: React.ReactNode
}) {
    const fallbackId = React.useId()
    const passwordId = id ?? fallbackId

    return (
        <Field data-invalid={invalid || undefined}>
            <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor={passwordId}>{label}</FieldLabel>
                <button
                    type="button"
                    className="text-[10px] leading-3.75 font-semibold tracking-[0.5px] text-auth-muted uppercase transition-colors hover:text-auth-ink"
                >
                    {action}
                </button>
            </div>
            <div className="relative">
                <Input
                    id={passwordId}
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={invalid || undefined}
                    placeholder={placeholder}
                    className="pr-8"
                />
                <button
                    type="button"
                    aria-label="Show password"
                    className="absolute top-1/2 right-0 flex size-6 -translate-y-1/2 items-center justify-center text-auth-muted transition-colors hover:text-auth-ink"
                >
                    <Eye className="size-4" />
                </button>
            </div>
            {error ? <FieldError>{error}</FieldError> : null}
        </Field>
    )
}

export function AuthVerifyForm({
                                   email,
                                   codeLength = 6,
                                   resendLabel = "Didn't receive the code?",
                                   resendActionLabel = "Resend",
                                   submitLabel = "Verify",
                                   className,
                                   ...props
                               }: AuthVerifyFormProps) {
    const midpoint = Math.ceil(codeLength / 2)
    const slots = Array.from({ length: codeLength }, (_, index) => index)

    return (
        <form className={cn("flex w-full flex-col gap-8", className)} {...props}>
            <FieldDescription className="text-center">
                Verification code sent to <span className="text-auth-ink">{email}</span>
            </FieldDescription>

            <InputOTP maxLength={codeLength}>
                <div className="flex w-full items-center justify-center gap-3">
                    <InputOTPGroup>
                        {slots.slice(0, midpoint).map((slot) => (
                            <InputOTPSlot key={slot} index={slot} />
                        ))}
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        {slots.slice(midpoint).map((slot) => (
                            <InputOTPSlot key={slot} index={slot} />
                        ))}
                    </InputOTPGroup>
                </div>
            </InputOTP>

            <p className="text-center text-sm leading-5 font-medium tracking-[0.7px] text-auth-muted">
                {resendLabel}{" "}
                <button
                    type="button"
                    className="border-b border-dashed border-auth-ink px-0.5 pb-px text-auth-ink"
                >
                    {resendActionLabel}
                </button>
            </p>

            <Button type="submit" size="email" className="w-full font-semibold tracking-[0.35px]">
                {submitLabel}
                <ArrowRight data-icon="inline-end" />
            </Button>
        </form>
    )
}

export function AuthSuccess({
                                title = "Successful",
                                description = "Your account has been created and verified.",
                                className,
                                ...props
                            }: AuthSuccessProps) {
    return (
        <div
            className={cn("flex w-full flex-col items-center gap-6 text-center", className)}
            {...props}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex size-16 items-center justify-center rounded-full bg-auth-success-surface"
            >
                <div className="flex size-10 items-center justify-center rounded-full bg-auth-success text-white">
                    <Check className="size-6" />
                </div>
            </motion.div>

            <div className="flex max-w-70 flex-col gap-3">
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
