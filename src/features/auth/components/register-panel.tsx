"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {LoaderCircle, RefreshCw, TriangleAlert} from "lucide-react";
import {useTranslations} from "next-intl";
import {useEffect, useMemo, useState} from "react";
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
 * 注册面板属性, 包含 locale 和可选验证入口状态
 */
interface RegisterPanelProps {
    locale: string;
    returnTo?: string;
    initialEmail?: string;
    startInVerify?: boolean;
}

/**
 * 注册表单值, 用于本地账号注册请求
 */
interface RegisterFormValues {
    email: string;
    password: string;
    username: string;
    nickname: string;
    phoneCountryCode?: string;
    phoneNationalNumber?: string;
}

/**
 * 验证表单值, 用于激活码提交
 */
interface VerifyFormValues {
    code: string;
}

/**
 * 为邮件投递状态解析本地化状态文案
 *
 * @param t 翻译函数
 * @param status 后端返回的原始状态
 * @returns 本地化状态文案
 */
function resolveEmailStatusText(t: ReturnType<typeof useTranslations>, status: string | null): string {
    if (!status) {
        return t("verify.status.unknown");
    }

    switch (status.toUpperCase()) {
        case "SENT":
            return t("verify.status.sent");
        case "QUEUED":
        case "PENDING":
            return t("verify.status.pending");
        case "DELIVERED":
            return t("verify.status.delivered");
        case "BOUNCED":
        case "FAILED":
            return t("verify.status.failed");
        default:
            return `${t("verify.status.rawPrefix")}: ${status}`;
    }
}

/**
 * 检查后端冲突消息是否指向已占用邮箱
 *
 * @param message 后端错误消息
 * @returns 当邮箱已被占用时返回 true
 */
function isEmailTakenMessage(message: string): boolean {
    return /邮箱|email/i.test(message);
}

/**
 * 检查后端冲突消息是否指向已占用用户名
 *
 * @param message 后端错误消息
 * @returns 当用户名已被占用时返回 true
 */
function isUsernameTakenMessage(message: string): boolean {
    return /用户名|username/i.test(message);
}

/**
 * 检查后端冲突消息是否指向已占用手机号
 *
 * @param message 后端错误消息
 * @returns 当手机号已被占用时返回 true
 */
function isPhoneTakenMessage(message: string): boolean {
    return /手机号|phone/i.test(message);
}

/**
 * 渲染注册面板, 支持 OAuth 注册和邮箱验证流程
 *
 * @param props 注册面板属性
 * @returns 注册面板视图
 */
export function RegisterPanel({
                                  locale,
                                  returnTo,
                                  initialEmail,
                                  startInVerify = false,
                              }: RegisterPanelProps) {
    const t = useTranslations("AuthRegisterPage");
    const safeReturnTo = sanitizeInternalPath(returnTo);

    const registerSchema = useMemo(
        () =>
            z
                .object({
                    email: z.email(t("errors.invalidEmail")),
                    password: z.string().trim().min(8, t("errors.passwordRule")),
                    username: z.string().trim().min(3, t("errors.usernameRule")),
                    nickname: z.string().trim().min(1, t("errors.nicknameRequired")),
                    phoneCountryCode: z.string().trim().optional(),
                    phoneNationalNumber: z.string().trim().optional(),
                })
                .superRefine((values, ctx) => {
                    const hasCountryCode = Boolean(values.phoneCountryCode);
                    const hasPhone = Boolean(values.phoneNationalNumber);

                    if (hasCountryCode !== hasPhone) {
                        ctx.addIssue({
                            code: "custom",
                            message: t("errors.phonePair"),
                            path: ["phoneNationalNumber"],
                        });
                    }
                }),
        [t],
    );

    const verifySchema = useMemo(
        () =>
            z.object({
                code: z
                    .string()
                    .trim()
                    .min(6, t("errors.verifyCodeRule"))
                    .max(6, t("errors.verifyCodeRule")),
            }),
        [t],
    );

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: initialEmail ?? "",
            password: "",
            username: "",
            nickname: "",
            phoneCountryCode: "",
            phoneNationalNumber: "",
        },
    });

    const verifyForm = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: "",
        },
    });

    const [phase, setPhase] = useState<"register" | "verify">(
        startInVerify && initialEmail ? "verify" : "register",
    );
    const [targetEmail, setTargetEmail] = useState(initialEmail ?? "");
    const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [emailStatus, setEmailStatus] = useState<string | null>(null);
    const [manualRefreshEnabled, setManualRefreshEnabled] = useState(false);
    const [isStatusLoading, setIsStatusLoading] = useState(false);
    const [isResendingActivation, setIsResendingActivation] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [phoneExpanded, setPhoneExpanded] = useState(false);

    const username = registerForm.watch("username");

    useEffect(() => {
        if (!username) {
            return;
        }

        if (registerForm.formState.dirtyFields.nickname) {
            return;
        }

        registerForm.setValue("nickname", username, {shouldValidate: true});
    }, [username, registerForm]);

    useEffect(() => {
        if (resendCooldown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        if (phase !== "verify" || !targetEmail) {
            return;
        }

        const startedAt = Date.now();
        setManualRefreshEnabled(false);

        void pollEmailStatus(targetEmail);

        const timer = window.setInterval(() => {
            if (Date.now() - startedAt >= 60_000) {
                setManualRefreshEnabled(true);
                window.clearInterval(timer);
                return;
            }

            void pollEmailStatus(targetEmail);
        }, 5000);

        return () => window.clearInterval(timer);
    }, [phase, targetEmail]);

    const loginPath = useMemo(() => {
        const params = new URLSearchParams();
        if (safeReturnTo) {
            params.set("returnTo", safeReturnTo);
        }

        const search = params.toString();
        return `/login${search ? `?${search}` : ""}`;
    }, [safeReturnTo]);

    const verifyStepPath = useMemo(() => {
        if (!targetEmail) {
            return loginPath;
        }

        const params = new URLSearchParams({
            step: "verify",
            email: targetEmail,
        });

        if (safeReturnTo) {
            params.set("returnTo", safeReturnTo);
        }

        return `/register?${params.toString()}`;
    }, [loginPath, safeReturnTo, targetEmail]);

    /**
     * 解析认证后的目标地址, 并在浏览器中跳转
     */
    async function gotoPostAuthDestination() {
        const nextPath = await resolvePostAuthDestination(locale, safeReturnTo);
        window.location.assign(nextPath);
    }

    /**
     * 为注册意图发起 OAuth 授权流程
     *
     * @param provider 选中的 OAuth 提供方
     */
    async function handleOauthClick(provider: OAuthProvider) {
        setAlertMessage(null);
        setStatusMessage(null);
        setPendingProvider(provider);

        try {
            const callbackReturnUrl = createOAuthCallbackReturnUrl({
                origin: window.location.origin,
                locale,
                provider,
                intent: "register",
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
            if (error instanceof BffRequestError && error.status === 429)
                setAlertMessage(t("errors.tooManyRequests"));
            else if (error instanceof BffRequestError)
                setAlertMessage(error.message || t("errors.oauthFailed"));
            else
                setAlertMessage(t("errors.network"));

            setPendingProvider(null);
        }
    }

    /**
     * 轮询邮件状态, 用于验证阶段状态展示
     *
     * @param email 目标邮箱地址
     */
    async function pollEmailStatus(email: string) {
        setIsStatusLoading(true);

        try {
            const result = await requestBff<{
                status?: string
            }>(`/api/bff/auth/email-status?email=${encodeURIComponent(email)}`, {
                method: "GET",
            });
            setEmailStatus(result.data?.status ?? null);
        } catch {
            setEmailStatus(null);
        } finally {
            setIsStatusLoading(false);
        }
    }

    /**
     * 提交本地注册请求, 并切换到验证阶段
     *
     * @param values 注册表单值
     */
    async function handleRegister(values: RegisterFormValues) {
        setAlertMessage(null);
        setStatusMessage(null);

        try {
            await requestBff("/api/bff/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    username: values.username,
                    password: values.password,
                    nickname: values.nickname,
                    email: values.email,
                    phone_country_code: values.phoneCountryCode || null,
                    phone_national_number: values.phoneNationalNumber || null,
                }),
            });

            setTargetEmail(values.email);
            setPhase("verify");
            setEmailStatus("SENT");
            setStatusMessage(t("messages.activationSent"));
            verifyForm.reset({code: ""});
        } catch (error) {
            if (error instanceof BffRequestError) {
                if (error.status === 409) {
                    if (isEmailTakenMessage(error.message)) {
                        registerForm.setError("email", {message: t("errors.emailTaken")});
                    } else if (isUsernameTakenMessage(error.message)) {
                        registerForm.setError("username", {message: t("errors.usernameTaken")});
                    } else if (isPhoneTakenMessage(error.message)) {
                        registerForm.setError("phoneNationalNumber", {message: t("errors.phoneTaken")});
                    }
                }

                if (error.status === 429) {
                    setAlertMessage(t("errors.tooManyRequests"));
                } else {
                    setAlertMessage(error.message || t("errors.registerFailed"));
                }

                return;
            }

            setAlertMessage(t("errors.network"));
        }
    }

    /**
     * 提交激活码并完成账号验证
     *
     * @param values 验证表单值
     */
    async function handleVerify(values: VerifyFormValues) {
        if (!targetEmail) {
            setAlertMessage(t("errors.activationEmailRequired"));
            return;
        }

        setAlertMessage(null);
        setStatusMessage(null);

        try {
            await requestBff("/api/bff/auth/verify-email", {
                method: "POST",
                body: JSON.stringify({
                    email: targetEmail,
                    code: values.code,
                }),
            });

            await gotoPostAuthDestination();
        } catch (error) {
            if (error instanceof BffRequestError) {
                if (error.status === 422) {
                    verifyForm.setError("code", {message: t("errors.verifyCodeInvalid")});
                    return;
                }

                if (error.status === 429) {
                    setAlertMessage(t("errors.tooManyRequests"));
                } else {
                    setAlertMessage(error.message || t("errors.verifyFailed"));
                }

                return;
            }

            setAlertMessage(t("errors.network"));
        }
    }

    /**
     * 为当前验证目标重发激活邮件
     */
    async function handleResendActivation() {
        if (!targetEmail) {
            setAlertMessage(t("errors.activationEmailRequired"));
            return;
        }

        setAlertMessage(null);
        setStatusMessage(null);
        setIsResendingActivation(true);

        try {
            await requestBff("/api/bff/auth/resend-activation", {
                method: "POST",
                body: JSON.stringify({
                    email: targetEmail,
                }),
            });

            setResendCooldown(60);
            setStatusMessage(t("messages.activationResent"));
            void pollEmailStatus(targetEmail);
        } catch (error) {
            if (error instanceof BffRequestError && error.status === 429) {
                setAlertMessage(t("errors.tooManyRequests"));
            } else if (error instanceof BffRequestError) {
                setAlertMessage(error.message || t("errors.activationResendFailed"));
            } else {
                setAlertMessage(t("errors.network"));
            }
        } finally {
            setIsResendingActivation(false);
        }
    }

    /**
     * 从验证阶段返回注册阶段
     */
    function backToRegister() {
        setPhase("register");
        setAlertMessage(null);
        setStatusMessage(null);
        setEmailStatus(null);
        setManualRefreshEnabled(false);
        setResendCooldown(0);
        verifyForm.reset({code: ""});
        registerForm.setValue("email", targetEmail, {shouldDirty: true});
        registerForm.setValue("password", "");
    }

    const isBusy =
        pendingProvider !== null ||
        registerForm.formState.isSubmitting ||
        verifyForm.formState.isSubmitting ||
        isResendingActivation;

    return (
        <Card className="border-border bg-card shadow-sm">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-foreground">{t("card.title")}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{t("card.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {alertMessage ? (
                    <Alert variant="destructive">
                        <TriangleAlert className="size-4"/>
                        <AlertTitle>{t("messages.submitFailed")}</AlertTitle>
                        <AlertDescription>{alertMessage}</AlertDescription>
                    </Alert>
                ) : null}

                {statusMessage ? (
                    <Alert>
                        <RefreshCw className="size-4"/>
                        <AlertTitle>{t("messages.statusUpdate")}</AlertTitle>
                        <AlertDescription>{statusMessage}</AlertDescription>
                    </Alert>
                ) : null}

                {phase === "register" ? (
                    <>
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

                        <form className="space-y-4" onSubmit={registerForm.handleSubmit(handleRegister)}>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t("fields.email")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder={t("fields.emailPlaceholder")}
                                    disabled={isBusy}
                                    {...registerForm.register("email")}
                                />
                                {registerForm.formState.errors.email ? (
                                    <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t("fields.password")}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder={t("fields.passwordPlaceholder")}
                                    disabled={isBusy}
                                    {...registerForm.register("password")}
                                />
                                <p className="text-xs text-muted-foreground">{t("fields.passwordHint")}</p>
                                {registerForm.formState.errors.password ? (
                                    <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                                ) : null}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="username">{t("fields.username")}</Label>
                                    <Input
                                        id="username"
                                        autoComplete="username"
                                        placeholder={t("fields.usernamePlaceholder")}
                                        disabled={isBusy}
                                        {...registerForm.register("username")}
                                    />
                                    {registerForm.formState.errors.username ? (
                                        <p className="text-xs text-destructive">{registerForm.formState.errors.username.message}</p>
                                    ) : null}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nickname">{t("fields.nickname")}</Label>
                                    <Input
                                        id="nickname"
                                        placeholder={t("fields.nicknamePlaceholder")}
                                        disabled={isBusy}
                                        {...registerForm.register("nickname")}
                                    />
                                    {registerForm.formState.errors.nickname ? (
                                        <p className="text-xs text-destructive">{registerForm.formState.errors.nickname.message}</p>
                                    ) : null}
                                </div>
                            </div>

                            {!phoneExpanded ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9"
                                    onClick={() => setPhoneExpanded(true)}
                                    disabled={isBusy}
                                >
                                    {t("actions.addPhoneOptional")}
                                </Button>
                            ) : null}

                            {phoneExpanded ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneCountryCode">{t("fields.phoneCountryCode")}</Label>
                                        <Input
                                            id="phoneCountryCode"
                                            placeholder={t("fields.phoneCountryCodePlaceholder")}
                                            disabled={isBusy}
                                            {...registerForm.register("phoneCountryCode")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNationalNumber">{t("fields.phoneNationalNumber")}</Label>
                                        <Input
                                            id="phoneNationalNumber"
                                            placeholder={t("fields.phoneNationalNumberPlaceholder")}
                                            disabled={isBusy}
                                            {...registerForm.register("phoneNationalNumber")}
                                        />
                                        {registerForm.formState.errors.phoneNationalNumber ? (
                                            <p className="text-xs text-destructive">
                                                {registerForm.formState.errors.phoneNationalNumber.message}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}

                            <Button type="submit" className="h-11 w-full" disabled={isBusy}>
                                {registerForm.formState.isSubmitting ? (
                                    <>
                                        <LoaderCircle className="size-4 animate-spin"/>
                                        {t("actions.creating")}
                                    </>
                                ) : (
                                    t("actions.create")
                                )}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1 rounded-xl border border-border bg-secondary/40 p-3">
                            <p className="text-sm font-medium text-foreground">{t("verify.title")}</p>
                            <p className="text-sm text-muted-foreground">{t("verify.email", {email: targetEmail})}</p>
                            <p className="text-sm text-muted-foreground">{resolveEmailStatusText(t, emailStatus)}</p>
                        </div>

                        <form className="space-y-4" onSubmit={verifyForm.handleSubmit(handleVerify)}>
                            <div className="space-y-2">
                                <Label htmlFor="verifyCode">{t("fields.verifyCode")}</Label>
                                <Input
                                    id="verifyCode"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder={t("fields.verifyCodePlaceholder")}
                                    disabled={isBusy}
                                    {...verifyForm.register("code")}
                                />
                                {verifyForm.formState.errors.code ? (
                                    <p className="text-xs text-destructive">{verifyForm.formState.errors.code.message}</p>
                                ) : null}
                            </div>

                            <Button type="submit" className="h-11 w-full" disabled={isBusy}>
                                {verifyForm.formState.isSubmitting ? (
                                    <>
                                        <LoaderCircle className="size-4 animate-spin"/>
                                        {t("actions.verifying")}
                                    </>
                                ) : (
                                    t("actions.verifyAndContinue")
                                )}
                            </Button>
                        </form>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className="h-9"
                                disabled={isBusy || resendCooldown > 0}
                                onClick={handleResendActivation}
                            >
                                {isResendingActivation ? (
                                    <>
                                        <LoaderCircle className="size-4 animate-spin"/>
                                        {t("actions.resending")}
                                    </>
                                ) : resendCooldown > 0 ? (
                                    t("actions.resendCountdown", {seconds: resendCooldown})
                                ) : (
                                    t("actions.resend")
                                )}
                            </Button>

                            <Button type="button" variant="outline" className="h-9" onClick={backToRegister}
                                    disabled={isBusy}>
                                {t("actions.editEmail")}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="h-9"
                                disabled={isBusy || !manualRefreshEnabled || isStatusLoading}
                                onClick={() => void pollEmailStatus(targetEmail)}
                            >
                                {isStatusLoading ? (
                                    <>
                                        <LoaderCircle className="size-4 animate-spin"/>
                                        {t("actions.refreshing")}
                                    </>
                                ) : (
                                    t("actions.refreshStatus")
                                )}
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">{t("verify.manualHint")}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="justify-center border-t border-border bg-secondary/30 p-4 text-sm">
                {phase === "register" ? (
                    <>
                        <span className="text-muted-foreground">{t("footer.hasAccount")}</span>
                        <Button asChild variant="link" className="h-auto px-2 py-0 text-sm">
                            <Link href={loginPath}>{t("footer.goLogin")}</Link>
                        </Button>
                    </>
                ) : (
                    <Button asChild variant="link" className="h-auto px-0 py-0 text-sm">
                        <Link href={verifyStepPath}>{t("footer.stayOnVerify")}</Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
