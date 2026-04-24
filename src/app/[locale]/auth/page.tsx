import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { AuthPageClient, type AuthPageCopy } from "./auth-page-client"

interface PageProps {
    params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: "Metadata" })

    return {
        title: t("title"),
        description: t("description"),
    }
}

export default async function AuthPage({ params }: PageProps) {
    const { locale } = await params
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
        form: {
            labels: {
                account: t("form.labels.account"),
                password: t("form.labels.password"),
                confirmPassword: t("form.labels.confirmPassword"),
                verificationSentTo: t("form.labels.verificationSentTo"),
            },
            placeholders: {
                account: t("form.placeholders.account"),
                password: t("form.placeholders.password"),
            },
            actions: {
                forgotPassword: t("form.actions.forgotPassword"),
            },
            buttons: {
                signIn: t("form.buttons.signIn"),
                signUp: t("form.buttons.signUp"),
                verify: t("form.buttons.verify"),
            },
            resendPrompt: t("form.resendPrompt"),
            resendAction: t("form.resendAction"),
            demoEmail: t("form.demoEmail"),
        },
        success: {
            verifyTitle: t("success.verifyTitle"),
            verifyDescription: t("success.verifyDescription"),
        },
    }

    return <AuthPageClient copy={copy} />
}
