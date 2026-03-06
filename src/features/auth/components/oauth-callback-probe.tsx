"use client";

import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";

import {Link, useRouter} from "@/i18n/navigation";
import {requestBff, FrontendApiError} from "@/lib/api/frontend";
import {safeRedirectPath} from "@/lib/url";
import {Button} from "@/components/ui/button";

/**
 * OAuth 回调确认组件入参
 */
interface OauthCallbackProbeProps {
    /** 登录完成后的目标路由 */
    redirectTo?: string;
}

/**
 * OAuth 回调确认组件, 用会话探测确认登录是否完成, 然后跳转目标页
 *
 * @param props 组件入参
 * @returns 回调确认节点
 */
export function OauthCallbackProbe({redirectTo}: OauthCallbackProbeProps) {
    const t = useTranslations("AuthOauthCallback");
    const router = useRouter();
    const [errorText, setErrorText] = useState<string | null>(null);
    const safeRedirect = safeRedirectPath(redirectTo, "/me/account");

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                await requestBff("/api/bff/me");
                if (cancelled) {
                    return;
                }

                router.replace(safeRedirect);
                router.refresh();
            } catch (error) {
                if (cancelled) {
                    return;
                }

                if (error instanceof FrontendApiError) {
                    setErrorText(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
                    return;
                }

                setErrorText(t("errors.unknown"));
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [router, safeRedirect, t]);

    if (!errorText) {
        return (
            <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t("status.checking")}</p>
                <p>{t("status.redirecting")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-destructive">{errorText}</p>
            <Button asChild className="w-full">
                <Link href="/login">{t("actions.backToLogin")}</Link>
            </Button>
        </div>
    );
}
