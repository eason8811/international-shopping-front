"use client";

import {CircleCheckBig, LoaderCircle, TriangleAlert} from "lucide-react";
import {useTranslations} from "next-intl";
import {useEffect, useMemo, useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {
    extractRedirectUrl,
    normalizeProvider,
    normalizeRedirectTarget,
    requestBff,
    resolvePostAuthDestination,
    sanitizeInternalPath,
    toLocalizedPath,
} from "@/features/auth/api/client";
import {Link} from "@/i18n/navigation";

/**
 * 回调面板属性, 用于 OAuth 回调处理
 */
interface OAuthCallbackPanelProps {
    locale: string;
    provider?: string;
    intent?: string;
    returnTo?: string;
    code?: string;
    state?: string;
    error?: string;
    errorDescription?: string;
}

/**
 * 检查路径是否指向回调路由, 用于避免重定向循环
 *
 * @param path 目标路径
 * @param locale 当前 locale
 * @returns 当目标路径为回调路由时返回 true
 */
function isCallbackPath(path: string, locale: string): boolean {
    const callbackPath = toLocalizedPath(locale, "/oauth2/callback");
    const normalizedPath = path.split("?", 1)[0] || path;
    return normalizedPath === callbackPath;
}

/**
 * 渲染 OAuth 回调状态面板, 处理回调交换, 会话校验和跳转流程
 *
 * @param props 回调面板属性
 * @returns OAuth 回调状态面板
 */
export function OAuthCallbackPanel({
                                       locale,
                                       provider,
                                       intent,
                                       returnTo,
                                       code,
                                       state,
                                       error,
                                       errorDescription,
                                   }: OAuthCallbackPanelProps) {
    const t = useTranslations("AuthOAuthCallbackPage");
    const safeReturnTo = sanitizeInternalPath(returnTo);

    const [phase, setPhase] = useState<"processing" | "success" | "failure">("processing");
    const [message, setMessage] = useState(t("status.processing"));

    const loginPath = useMemo(() => {
        const params = new URLSearchParams();
        if (safeReturnTo) {
            params.set("returnTo", safeReturnTo);
        }

        const search = params.toString();
        return `/login${search ? `?${search}` : ""}`;
    }, [safeReturnTo]);

    const emailLoginPath = useMemo(() => {
        const params = new URLSearchParams();
        params.set("email", "1");

        if (safeReturnTo) {
            params.set("returnTo", safeReturnTo);
        }

        return `/login?${params.toString()}`;
    }, [safeReturnTo]);

    useEffect(() => {
        let cancelled = false;

        /**
         * 执行回调流程, 包含回调请求, 会话校验和目标地址解析
         */
        async function run() {
            const normalizedProvider = normalizeProvider(provider ?? null);
            if (!normalizedProvider) {
                setPhase("failure");
                setMessage(t("errors.providerMissing"));
                return;
            }

            const callbackEndpoint =
                intent === "bind"
                    ? `/api/bff/account/bindings/oauth2/${normalizedProvider}/callback`
                    : `/api/bff/auth/oauth2/${normalizedProvider}/callback`;

            let callbackTarget: string | null = null;

            try {
                const shouldInvokeCallback = Boolean(code || state || error || errorDescription);

                if (shouldInvokeCallback) {
                    const query = new URLSearchParams();
                    if (code) {
                        query.set("code", code);
                    }
                    if (state) {
                        query.set("state", state);
                    }
                    if (error) {
                        query.set("error", error);
                    }
                    if (errorDescription) {
                        query.set("error_description", errorDescription);
                    }

                    const result = await requestBff(
                        `${callbackEndpoint}${query.toString() ? `?${query.toString()}` : ""}`,
                        {method: "GET"},
                    );
                    callbackTarget = extractRedirectUrl(result.data);
                }
            } catch (reason) {
                if (cancelled) {
                    return;
                }

                setPhase("failure");
                setMessage(reason instanceof Error ? reason.message : t("errors.callbackFailed"));
                return;
            }

            try {
                await requestBff("/api/bff/me", {method: "GET"});
            } catch {
                if (cancelled) {
                    return;
                }

                setPhase("failure");
                setMessage(t("errors.sessionNotEstablished"));
                return;
            }

            let destination = safeReturnTo;

            if (!destination) {
                const normalizedTarget = normalizeRedirectTarget(callbackTarget, window.location.origin);
                if (normalizedTarget && !isCallbackPath(normalizedTarget, locale)) {
                    destination = normalizedTarget;
                }
            }

            if (!destination) {
                destination = await resolvePostAuthDestination(locale, safeReturnTo);
            }

            if (cancelled) {
                return;
            }

            setPhase("success");
            setMessage(t("status.success"));
            window.setTimeout(() => {
                if (!cancelled) {
                    window.location.assign(destination);
                }
            }, 800);
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [
        code,
        error,
        errorDescription,
        intent,
        locale,
        provider,
        safeReturnTo,
        state,
        t,
    ]);

    return (
        <section className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:px-6 md:py-10 xl:py-12">
            <Card className="w-full max-w-sm border-border bg-card shadow-sm sm:max-w-md">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-xl text-foreground">{t("card.title")}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{t("card.subtitle")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {phase === "processing" ? (
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 text-sm text-foreground">
                            <LoaderCircle className="size-4 animate-spin"/>
                            <span>{message}</span>
                        </div>
                    ) : null}

                    {phase === "success" ? (
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 text-sm text-foreground">
                            <CircleCheckBig className="size-4 text-primary"/>
                            <span>{message}</span>
                        </div>
                    ) : null}

                    {phase === "failure" ? (
                        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            <TriangleAlert className="size-4"/>
                            <span>{message}</span>
                        </div>
                    ) : null}
                </CardContent>

                {phase === "failure" ? (
                    <CardFooter className="flex flex-col-reverse gap-2 border-t border-border bg-secondary/30 p-4 sm:flex-row sm:justify-end">
                        <Button asChild variant="outline" className="h-9 w-full sm:w-auto">
                            <Link href={loginPath}>{t("actions.backToLogin")}</Link>
                        </Button>
                        <Button asChild className="h-9 w-full sm:w-auto">
                            <Link href={emailLoginPath}>{t("actions.useEmail")}</Link>
                        </Button>
                    </CardFooter>
                ) : null}
            </Card>
        </section>
    );
}
