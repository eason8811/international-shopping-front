import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { AuthPageClient, type AuthPageCopy } from "./auth-page-client"

interface PageProps {
    params: Promise<{ locale: string }>
    searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Metadata" })

    return {
        title: t("title"),
        description: t("description"),
    }
}

export default async function AuthPage({ params, searchParams }: PageProps) {
    const { locale } = await params
    const resolvedSearchParams = await searchParams
    setRequestLocale(locale)

    const t = await getTranslations("AuthUi")
    const copy: AuthPageCopy = {
        shell: {
            brand: t("shell.brand"),
            nav: {
                collections: t("shell.nav.collections"),
                newArrivals: t("shell.nav.newArrivals"),
                support: t("shell.nav.support"),
            },
            searchPlaceholder: t("shell.searchPlaceholder"),
            menuLabel: t("shell.menuLabel"),
            searchLabel: t("shell.searchLabel"),
            cartLabel: t("shell.cartLabel"),
            quote: t("layout.quote"),
            quoteAuthor: t("layout.quoteAuthor"),
        },
        social: {
            google: t("social.google"),
            tiktok: t("social.tiktok"),
            x: t("social.x"),
        },
        login: {
            title: t("login.title"),
            subtitle: t("login.subtitle"),
            divider: t("login.divider"),
            continueWithEmail: t("login.continueWithEmail"),
            footerPrompt: t("login.footerPrompt"),
            footerAction: t("login.footerAction"),
        },
        register: {
            title: t("register.title"),
            subtitle: t("register.subtitle"),
            divider: t("register.divider"),
            continueWithEmail: t("register.continueWithEmail"),
            footerPrompt: t("register.footerPrompt"),
            footerAction: t("register.footerAction"),
        },
        forgot: {
            title: t("forgot.title"),
            subtitle: t("forgot.subtitle"),
            footerPrompt: t("forgot.footerPrompt"),
            footerAction: t("forgot.footerAction"),
        },
        form: {
            labels: {
                account: t("form.labels.account"),
                email: t("form.labels.email"),
                password: t("form.labels.password"),
                newPassword: t("form.labels.newPassword"),
                confirmPassword: t("form.labels.confirmPassword"),
                verificationSentTo: t("form.labels.verificationSentTo"),
            },
            placeholders: {
                account: t("form.placeholders.account"),
                email: t("form.placeholders.email"),
                password: t("form.placeholders.password"),
            },
            actions: {
                forgotPassword: t("form.actions.forgotPassword"),
                showPassword: t("form.actions.showPassword"),
                hidePassword: t("form.actions.hidePassword"),
            },
            buttons: {
                signIn: t("form.buttons.signIn"),
                signUp: t("form.buttons.signUp"),
                sendCode: t("form.buttons.sendCode"),
                verify: t("form.buttons.verify"),
                resetPassword: t("form.buttons.resetPassword"),
            },
            resendPrompt: t("form.resendPrompt"),
            resendAction: t("form.resendAction"),
            sentCountdown: t("form.sentCountdown", { seconds: "{seconds}" }),
            resendSuccess: t("form.resendSuccess"),
            errors: {
                loginFailed: t("form.errors.loginFailed"),
                registerFailed: t("form.errors.registerFailed"),
                verifyFailed: t("form.errors.verifyFailed"),
                resetRequestFailed: t("form.errors.resetRequestFailed"),
                resetFailed: t("form.errors.resetFailed"),
                resendFailed: t("form.errors.resendFailed"),
            },
            validation: {
                accountRequired: t("form.validation.accountRequired"),
                accountInvalid: t("form.validation.accountInvalid"),
                codeRequired: t("form.validation.codeRequired"),
                emailRequired: t("form.validation.emailRequired"),
                emailInvalid: t("form.validation.emailInvalid"),
                phoneInvalid: t("form.validation.phoneInvalid"),
                passwordRequired: t("form.validation.passwordRequired"),
                passwordInvalid: t("form.validation.passwordInvalid"),
                confirmPasswordRequired: t("form.validation.confirmPasswordRequired"),
                confirmPasswordMismatch: t("form.validation.confirmPasswordMismatch"),
            },
        },
        reset: {
            accountLabel: t("reset.accountLabel"),
            codeLabel: t("reset.codeLabel"),
        },
        success: {
            loginTitle: t("success.loginTitle"),
            loginDescription: t("success.loginDescription"),
            verifyTitle: t("success.verifyTitle"),
            verifyDescription: t("success.verifyDescription"),
            resetTitle: t("success.resetTitle"),
            resetDescription: t("success.resetDescription"),
            oauthTitle: t("success.oauthTitle"),
            oauthDescription: t("success.oauthDescription"),
        },
    }

    const oauthStatus = readSingleSearchParam(resolvedSearchParams, "oauth")
    const oauthError = readSingleSearchParam(resolvedSearchParams, "oauth_error")
        ?? readSingleSearchParam(resolvedSearchParams, "error_description")
        ?? readSingleSearchParam(resolvedSearchParams, "error")

    return (
        <AuthPageClient
            copy={copy}
            locale={locale}
            initialOAuthStatus={oauthStatus === "success" ? "success" : oauthError ? "error" : undefined}
            initialOAuthError={oauthError}
        />
    )
}

function readSingleSearchParam(
    searchParams: Record<string, string | string[] | undefined> | undefined,
    key: string,
): string | undefined {
    const value = searchParams?.[key]
    return Array.isArray(value) ? value[0] : value
}
