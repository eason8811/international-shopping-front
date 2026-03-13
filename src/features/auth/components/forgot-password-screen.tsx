"use client";

import {useState} from "react";
import {Mail} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {AnimatePresence, motion} from "motion/react";

import {Link, useRouter} from "@/i18n/navigation";
import {Button} from "@/components/ui/button";
import {Toaster} from "@/components/ui/sonner";
import {AuthLayout, authItemVariants} from "./auth-layout";
import {EmailAuthForm} from "./email-auth-form";
import {SocialAuthButtons} from "./social-auth-buttons";

interface LoginScreenProps {
    redirectTo?: string;
}

export function LoginScreen({redirectTo}: LoginScreenProps) {
    const t = useTranslations("AuthUi.login");
    const locale = useLocale();
    const router = useRouter();
    const [showEmail, setShowEmail] = useState(false);
    const safeRedirect = normalizeRedirectTarget(redirectTo, locale);

    return (
        <AuthLayout title={t("title")} subtitle={t("subtitle")}>
            <Toaster position="top-center" richColors/>

            <motion.div variants={authItemVariants}>
                <SocialAuthButtons/>
            </motion.div>

            <motion.div variants={authItemVariants} className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"/>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 font-medium text-muted-foreground">{t("divider")}</span>
                </div>
            </motion.div>

            <motion.div variants={authItemVariants}>
                <AnimatePresence initial={false} mode="wait">
                    {!showEmail ? (
                        <motion.div
                            key="email-btn-wrapper"
                            initial={{opacity: 0, height: 0}}
                            animate={{opacity: 1, height: "auto"}}
                            exit={{opacity: 0, height: 0}}
                            transition={{duration: 0.3}}
                        >
                            <Button
                                variant="outline"
                                className="flex h-12 w-full items-center justify-center gap-3 font-medium text-foreground hover:bg-accent"
                                onClick={() => setShowEmail(true)}
                            >
                                <Mail className="size-5"/>
                                {t("continueWithEmail")}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="email-form-wrapper"
                            initial={{opacity: 0, height: 0}}
                            animate={{opacity: 1, height: "auto"}}
                            exit={{opacity: 0, height: 0}}
                            transition={{duration: 0.3}}
                        >
                            <EmailAuthForm
                                mode="login"
                                onSuccess={() => {
                                    router.replace(safeRedirect);
                                    router.refresh();
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div variants={authItemVariants} className="mt-2 text-center">
                <span className="text-sm text-muted-foreground">
                    {t("footerPrompt")}{" "}
                    <Link
                        href="/register"
                        className="font-medium text-foreground transition-colors hover:underline underline-offset-4"
                    >
                        {t("footerAction")}
                    </Link>
                </span>
            </motion.div>
        </AuthLayout>
    );
}

function normalizeRedirectTarget(value: string | undefined, locale: string): string {
    if (!value?.startsWith("/")) {
        return "/me/account";
    }

    const localePrefix = `/${locale}`;
    if (value === localePrefix) {
        return "/";
    }

    if (value.startsWith(`${localePrefix}/`)) {
        return value.slice(localePrefix.length) || "/";
    }

    return value;
}
