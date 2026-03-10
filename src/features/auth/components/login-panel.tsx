"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {LoaderCircle, TriangleAlert} from "lucide-react";
import {useTranslations} from "next-intl";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";

import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {Link} from "@/i18n/navigation";
import {
    createOAuthCallbackReturnUrl,
    extractRedirectUrl,
    requestBff,
    resolvePostAuthDestination,
    sanitizeInternalPath,
} from "@/features/auth/api/client";
import {type OAuthProvider} from "@/features/auth/constants";
import {OAuthProviderButtons} from "@/features/auth/components/oauth-provider-buttons";
import {BffRequestError} from "@/features/auth/types";

/**
 * 登录面板属性
 */
interface LoginPanelProps {
    locale: string;
    returnTo?: string;
    expandEmail?: boolean;
}

/**
 * 登录表单值, 用于邮箱密码登录流程
 */
interface LoginFormValues {
    account: string;
    password: string;
}

/**
 * 检查后端错误消息是否表示账号未激活
 *
 * @param message 后端错误消息
 * @returns 当消息表示账号未激活时返回 true
 */
function isInactiveAccountMessage(message: string): boolean {
    return /未激活|inactive|disabled/i.test(message);
}

/**
 * 检查输入值是否像邮箱地址
 *
 * @param input 账号输入值
 * @returns 当输入值看起来像邮箱时返回 true
 */
function isEmail(input: string): boolean {
    return /.+@.+\..+/.test(input);
}

/**
 * 渲染登录面板, 支持 OAuth 优先流程和可选邮箱密码流程
 *
 * @param props 登录面板属性
 * @returns 登录面板视图
 */
export function LoginPanel({locale, returnTo, expandEmail = false}: LoginPanelProps) {
    const t = useTranslations("AuthLoginPage");
    const safeReturnTo = sanitizeInternalPath(returnTo);

    const schema = useMemo(
        () =>
            z.object({
                account: z.string().trim().min(1, t("errors.accountRequired")),
                password: z.string().trim().min(1, t("errors.passwordRequired")),
            }),
        [t],
    );

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            account: "",
            password: "",
        },
    });

    const [emailExpanded, setEmailExpanded] = useState(expandEmail);
    const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [inactiveActionsVisible, setInactiveActionsVisible] = useState(false);
    const [activationEmail, setActivationEmail] = useState("");
    const [resendingActivation, setResendingActivation] = useState(false);

    const isBusy = form.formState.isSubmitting || pendingProvider !== null || resendingActivation;

    const forgotPath = useMemo(() => {
        const params = new URLSearchParams();
        if (safeReturnTo) {
            params.set("returnTo", safeReturnTo);
        }

        const search = params.toString();
        return `/forgot-password${search ? `?${search}` : ""}`;
    }, [safeReturnTo]);

    const registerPath = useMemo(() => {
        const params = new URLSearchParams();
        if (safeReturnTo) {
            params.set("returnTo", safeReturnTo);
        }

        const search = params.toString();
        return `/register${search ? `?${search}` : ""}`;
    }, [safeReturnTo]);

    const verifyPath = useMemo(() => {
        const params = new URLSearchParams();
        params.set("step", "verify");

        if (activationEmail) {
            params.set("email", activationEmail);
        }

        if (safeReturnTo) {
            params.set("returnTo", safeReturnTo);
        }

        return `/register?${params.toString()}`;
    }, [activationEmail, safeReturnTo]);

    /**
     * 在认证成功后解析目标地址, 并在客户端跳转
     */
    async function gotoPostAuthDestination() {
        const nextPath = await resolvePostAuthDestination(locale, safeReturnTo);
        window.location.assign(nextPath);
    }

    /**
     * 为选中的提供方发起 OAuth 授权流程
     *
     * @param provider 选中的 OAuth 提供方
     */
    async function handleOauthClick(provider: OAuthProvider) {
        setAlertMessage(null);
        setPendingProvider(provider);

        try {
            const callbackReturnUrl = createOAuthCallbackReturnUrl({
                origin: window.location.origin,
                locale,
                provider,
                intent: "login",
                returnTo: safeReturnTo,
            });

            const result = await requestBff(`/api/bff/auth/oauth2/${provider}/authorize?redirectUrl=${encodeURIComponent(callbackReturnUrl)}`, {
                method: "GET",
            });
            const authorizeUrl = extractRedirectUrl(result.data);

            if (!authorizeUrl) {
                setAlertMessage(t("errors.oauthAuthorizeMissing") || t("errors.oauthFailed"));
                return;
            }

            window.location.assign(authorizeUrl);
        } catch (error) {
            if (error instanceof BffRequestError && error.status === 429) {
                setAlertMessage(t("errors.tooManyRequests"));
            } else if (error instanceof BffRequestError) {
                setAlertMessage(error.message || t("errors.oauthFailed"));
            } else {
                setAlertMessage(t("errors.network"));
            }

            setPendingProvider(null);
        }
    }

    /**
     * 提交邮箱密码登录表单
     *
     * @param values 表单值
     */
    async function onSubmit(values: LoginFormValues) {
        setAlertMessage(null);
        setInactiveActionsVisible(false);

        try {
            await requestBff("/api/bff/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    account: values.account,
                    password: values.password,
                }),
            });

            await gotoPostAuthDestination();
        } catch (error) {
            if (error instanceof BffRequestError) {
                if (error.status === 429) {
                    setAlertMessage(t("errors.tooManyRequests"));
                } else {
                    setAlertMessage(error.message || t("errors.loginFailed"));
                }

                if (error.status === 401 && isInactiveAccountMessage(error.message)) {
                    const nextActivationEmail = isEmail(values.account) ? values.account : "";
                    setActivationEmail(nextActivationEmail);
                    setInactiveActionsVisible(true);
                }

                return;
            }

            setAlertMessage(t("errors.network"));
        }
    }

    /**
     * 重发激活邮件, 用于未激活账号恢复流程
     */
    async function resendActivationEmail() {
        if (!isEmail(activationEmail)) {
            setAlertMessage(t("errors.activationEmailRequired"));
            return;
        }

        setResendingActivation(true);
        setAlertMessage(null);

        try {
            await requestBff("/api/bff/auth/resend-activation", {
                method: "POST",
                body: JSON.stringify({
                    email: activationEmail,
                }),
            });

            setAlertMessage(t("messages.activationSent"));
        } catch (error) {
            if (error instanceof BffRequestError && error.status === 429) {
                setAlertMessage(t("errors.tooManyRequests"));
            } else if (error instanceof BffRequestError) {
                setAlertMessage(error.message || t("errors.activationResendFailed"));
            } else {
                setAlertMessage(t("errors.network"));
            }
        } finally {
            setResendingActivation(false);
        }
    }

    return (
        <Card className="border-border bg-card shadow-sm">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-foreground">{t("card.title")}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{t("card.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {alertMessage ? (
                    <Alert variant={inactiveActionsVisible ? "default" : "destructive"}>
                        <TriangleAlert className="size-4"/>
                        <AlertTitle>{inactiveActionsVisible ? t("messages.attention") : t("messages.submitFailed")}</AlertTitle>
                        <AlertDescription>{alertMessage}</AlertDescription>
                    </Alert>
                ) : null}

                <OAuthProviderButtons
                    labels={{
                        GOOGLE: t("oauth.google"),
                        TIKTOK: t("oauth.tiktok"),
                        X: t("oauth.x"),
                    }}
                    pendingProvider={pendingProvider}
                    disabled={isBusy}
                    onSelect={handleOauthClick}
                />

                <div className="flex items-center gap-3">
                    <Separator className="flex-1"/>
                    <span className="text-xs text-muted-foreground uppercase">{t("or")}</span>
                    <Separator className="flex-1"/>
                </div>

                <div className="space-y-3">
                    {!emailExpanded ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-full"
                            disabled={isBusy}
                            onClick={() => setEmailExpanded(true)}
                        >
                            {t("actions.useEmail")}
                        </Button>
                    ) : null}

                    {emailExpanded ? (
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="space-y-2">
                                <Label htmlFor="account">{t("fields.account")}</Label>
                                <Input
                                    id="account"
                                    autoComplete="username"
                                    placeholder={t("fields.accountPlaceholder")}
                                    disabled={isBusy}
                                    {...form.register("account")}
                                />
                                {form.formState.errors.account ? (
                                    <p className="text-xs text-destructive">{form.formState.errors.account.message}</p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t("fields.password")}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder={t("fields.passwordPlaceholder")}
                                    disabled={isBusy}
                                    {...form.register("password")}
                                />
                                {form.formState.errors.password ? (
                                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                                ) : null}
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Link href={forgotPath} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                                    {t("actions.forgotPassword")}
                                </Link>
                                <Button type="submit" className="h-10 w-full sm:w-auto sm:min-w-28" disabled={isBusy}>
                                    {form.formState.isSubmitting ? (
                                        <>
                                            <LoaderCircle className="size-4 animate-spin"/>
                                            {t("actions.loggingIn")}
                                        </>
                                    ) : (
                                        t("actions.submit")
                                    )}
                                </Button>
                            </div>
                        </form>
                    ) : null}
                </div>

                {inactiveActionsVisible ? (
                    <div className="space-y-3 rounded-xl border border-border bg-secondary/50 p-3">
                        <div className="space-y-2">
                            <Label htmlFor="activationEmail">{t("fields.activationEmail")}</Label>
                            <Input
                                id="activationEmail"
                                type="email"
                                placeholder={t("fields.activationEmailPlaceholder")}
                                value={activationEmail}
                                onChange={(event) => setActivationEmail(event.target.value)}
                                disabled={resendingActivation}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className="h-9"
                                disabled={resendingActivation}
                                onClick={resendActivationEmail}
                            >
                                {resendingActivation ? (
                                    <>
                                        <LoaderCircle className="size-4 animate-spin"/>
                                        {t("actions.resendingActivation")}
                                    </>
                                ) : (
                                    t("actions.resendActivation")
                                )}
                            </Button>
                            <Button asChild type="button" variant="outline" className="h-9">
                                <Link href={verifyPath}>{t("actions.enterActivationCode")}</Link>
                            </Button>
                        </div>
                    </div>
                ) : null}
            </CardContent>
            <CardFooter className="justify-center border-t border-border bg-secondary/30 p-4 text-sm">
                <span className="text-muted-foreground">{t("footer.noAccount")}</span>
                <Button asChild variant="link" className="h-auto px-2 py-0 text-sm">
                    <Link href={registerPath}>{t("footer.goRegister")}</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
