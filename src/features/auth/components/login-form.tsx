"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useTranslations, useLocale} from "next-intl";
import {useState} from "react";
import {useForm} from "react-hook-form";

import {login, getOauthAuthorizeUrl} from "@/features/auth/api";
import {loginSchema, type LoginSchema} from "@/features/auth/schemas";
import {type OAuthProvider} from "@/features/auth/types";
import {useRouter} from "@/i18n/navigation";
import {buildQueryString, FrontendApiError} from "@/lib/api/frontend";
import {safeRedirectPath} from "@/lib/url";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";

/**
 * 登录表单组件入参
 */
interface LoginFormProps {
    /** 登录成功后的跳转目标 */
    redirectTo?: string;
}

/**
 * 登录表单, 包含本地账号密码登录与第三方 OAuth2 登录入口
 *
 * @param props 组件入参
 * @returns 登录表单节点
 */
export function LoginForm({redirectTo}: LoginFormProps) {
    const t = useTranslations("AuthLogin");
    const locale = useLocale();
    const router = useRouter();
    const [errorText, setErrorText] = useState<string | null>(null);
    const [oauthPending, setOauthPending] = useState<OAuthProvider | null>(null);
    const safeRedirect = safeRedirectPath(redirectTo, "/me/account");

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            account: "",
            password: "",
            country_code: "",
        },
    });

    /**
     * 提交本地登录
     *
     * @param values 表单值
     */
    const onSubmit = form.handleSubmit(async (values) => {
        setErrorText(null);

        try {
            await login(values);
            router.push(safeRedirect);
            router.refresh();
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setErrorText(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
                return;
            }

            setErrorText(t("errors.unknown"));
        }
    });

    /**
     * 发起 OAuth2 登录
     *
     * @param provider OAuth provider
     */
    const handleOauthLogin = async (provider: OAuthProvider) => {
        setErrorText(null);
        setOauthPending(provider);

        try {
            const callbackPath = `/${locale}/oauth2/callback${buildQueryString({
                redirect: safeRedirect,
            })}`;
            const authorizeUrl = await getOauthAuthorizeUrl(provider, callbackPath);

            if (!authorizeUrl) {
                setErrorText(t("errors.oauthUrlMissing"));
                setOauthPending(null);
                return;
            }

            window.location.assign(authorizeUrl);
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setErrorText(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
            } else {
                setErrorText(t("errors.unknown"));
            }
            setOauthPending(null);
        }
    };

    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={form.formState.isSubmitting || Boolean(oauthPending)}
                    onClick={() => handleOauthLogin("GOOGLE")}
                >
                    {oauthPending === "GOOGLE" ? t("actions.redirecting") : t("actions.oauthGoogle")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={form.formState.isSubmitting || Boolean(oauthPending)}
                    onClick={() => handleOauthLogin("TIKTOK")}
                >
                    {oauthPending === "TIKTOK" ? t("actions.redirecting") : t("actions.oauthTiktok")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={form.formState.isSubmitting || Boolean(oauthPending)}
                    onClick={() => handleOauthLogin("X")}
                >
                    {oauthPending === "X" ? t("actions.redirecting") : t("actions.oauthX")}
                </Button>
            </div>

            <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                    <Separator/>
                </div>
                <p className="relative mx-auto w-fit bg-card px-2 text-xs text-muted-foreground">{t("actions.oauthDivider")}</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="login-account">{t("fields.account")}</Label>
                <Input
                    id="login-account"
                    placeholder={t("placeholders.account")}
                    autoComplete="username"
                    {...form.register("account")}
                />
                {form.formState.errors.account ? (
                    <p className="text-xs text-destructive">{t("errors.accountRequired")}</p>
                ) : null}
            </div>
            <div className="space-y-2">
                <Label htmlFor="login-password">{t("fields.password")}</Label>
                <Input
                    id="login-password"
                    type="password"
                    placeholder={t("placeholders.password")}
                    autoComplete="current-password"
                    {...form.register("password")}
                />
                {form.formState.errors.password ? (
                    <p className="text-xs text-destructive">{t("errors.passwordRequired")}</p>
                ) : null}
            </div>
            {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || Boolean(oauthPending)}>
                {form.formState.isSubmitting ? t("actions.loggingIn") : t("actions.login")}
            </Button>
        </form>
    );
}
