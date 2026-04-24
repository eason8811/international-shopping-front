"use client"

import * as React from "react"

import {
    AuthBlock,
    AuthEmailButton,
    AuthEmailForm,
    AuthFooterLink,
    AuthHeroText,
    AuthPageShell,
    AuthRegisterForm,
    AuthSuccess,
    AuthVerifyForm,
    type AuthShellCopy,
} from "@/components/blocks"

type AuthMode = "login" | "login-email" | "register" | "register-email" | "verify" | "success"
type AuthFlow = "login" | "register"

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
    social: {
        google: string
        tiktok: string
        x: string
    }
    form: {
        labels: {
            account: string
            password: string
            confirmPassword: string
            verificationSentTo: string
        }
        placeholders: {
            account: string
            password: string
        }
        actions: {
            forgotPassword: string
        }
        buttons: {
            signIn: string
            signUp: string
            verify: string
        }
        resendPrompt: string
        resendAction: string
        demoEmail: string
    }
    success: {
        verifyTitle: string
        verifyDescription: string
    }
}

export function AuthPageClient({ copy }: { copy: AuthPageCopy }) {
    const [mode, setMode] = React.useState<AuthMode>("login")
    const [flow, setFlow] = React.useState<AuthFlow>("login")

    const isRegister = flow === "register"
    const intro = isRegister ? copy.register : copy.login

    return (
        <AuthPageShell copy={copy.shell}>
            <AuthHeroText title={intro.title} subtitle={intro.subtitle} />

            <div className="flex w-full flex-col gap-12">
                <AuthBlock
                    providers={[
                        { provider: "google", label: copy.social.google },
                        { provider: "tiktok", label: copy.social.tiktok },
                        { provider: "x", label: copy.social.x },
                    ]}
                    separatorLabel={intro.divider}
                >
                    {mode === "login" ? (
                        <AuthEmailButton
                            label={copy.login.continueWithEmail}
                            onClick={() => {
                                setFlow("login")
                                setMode("login-email")
                            }}
                        />
                    ) : null}

                    {mode === "register" ? (
                        <AuthEmailButton
                            label={copy.register.continueWithEmail}
                            onClick={() => {
                                setFlow("register")
                                setMode("register-email")
                            }}
                        />
                    ) : null}

                    {mode === "login-email" ? (
                        <AuthEmailForm
                            emailLabel={copy.form.labels.account}
                            emailPlaceholder={copy.form.placeholders.account}
                            passwordLabel={copy.form.labels.password}
                            passwordPlaceholder={copy.form.placeholders.password}
                            forgotPasswordLabel={copy.form.actions.forgotPassword}
                            submitLabel={copy.form.buttons.signIn}
                            onSubmit={(event) => {
                                event.preventDefault()
                                setMode("success")
                            }}
                        />
                    ) : null}

                    {mode === "register-email" ? (
                        <AuthRegisterForm
                            accountLabel={copy.form.labels.account}
                            accountPlaceholder={copy.form.placeholders.account}
                            passwordLabel={copy.form.labels.password}
                            passwordPlaceholder={copy.form.placeholders.password}
                            confirmPasswordLabel={copy.form.labels.confirmPassword}
                            confirmPasswordPlaceholder={copy.form.placeholders.password}
                            submitLabel={copy.form.buttons.signUp}
                            onSubmit={(event) => {
                                event.preventDefault()
                                setMode("verify")
                            }}
                        />
                    ) : null}

                    {mode === "verify" ? (
                        <AuthVerifyForm
                            email={copy.form.demoEmail}
                            sentToLabel={copy.form.labels.verificationSentTo}
                            resendLabel={copy.form.resendPrompt}
                            resendActionLabel={copy.form.resendAction}
                            submitLabel={copy.form.buttons.verify}
                            onSubmit={(event) => {
                                event.preventDefault()
                                setMode("success")
                            }}
                        />
                    ) : null}

                    {mode === "success" ? (
                        <AuthSuccess
                            title={copy.success.verifyTitle}
                            description={copy.success.verifyDescription}
                        />
                    ) : null}
                </AuthBlock>

                <AuthFooterLink
                    label={isRegister ? copy.register.footerPrompt : copy.login.footerPrompt}
                    action={isRegister ? copy.register.footerAction : copy.login.footerAction}
                    actionProps={{
                        onClick: () => {
                            const nextFlow = isRegister ? "login" : "register"
                            setFlow(nextFlow)
                            setMode(nextFlow)
                        },
                    }}
                />
            </div>
        </AuthPageShell>
    )
}
