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
import {Link} from "@/i18n/navigation";
import {requestBff, resolvePostAuthDestination, sanitizeInternalPath} from "@/features/auth/api/client";
import {BffRequestError} from "@/features/auth/types";

/**
 * 忘记密码面板属性, 用于提供 locale 和回跳目标
 */
interface ForgotPasswordPanelProps {
    locale: string;
    returnTo?: string;
}

/**
 * 请求验证码表单值, 用于第一步
 */
interface RequestCodeFormValues {
    account: string;
    countryCode?: string;
}

/**
 * 重置密码表单值, 用于第二步
 */
interface ResetPasswordFormValues {
    code: string;
    newPassword: string;
}

/**
 * 渲染忘记密码面板, 包含请求和重置两个阶段
 *
 * @param props 忘记密码面板属性
 * @returns 忘记密码面板视图
 */
export function ForgotPasswordPanel({locale, returnTo}: ForgotPasswordPanelProps) {
    const t = useTranslations("AuthForgotPasswordPage");
    const safeReturnTo = sanitizeInternalPath(returnTo);

    const requestSchema = useMemo(
        () =>
            z.object({
                account: z.string().trim().min(1, t("errors.accountRequired")),
                countryCode: z.string().trim().optional(),
            }),
        [t],
    );

    const resetSchema = useMemo(
        () =>
            z.object({
                code: z
                    .string()
                    .trim()
                    .min(6, t("errors.codeRule"))
                    .max(6, t("errors.codeRule")),
                newPassword: z.string().trim().min(6, t("errors.newPasswordRule")),
            }),
        [t],
    );

    const requestForm = useForm<RequestCodeFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            account: "",
            countryCode: "",
        },
    });

    const resetForm = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            code: "",
            newPassword: "",
        },
    });

    const [phase, setPhase] = useState<"request" | "reset">("request");
    const [submittedAccount, setSubmittedAccount] = useState("");
    const [submittedCountryCode, setSubmittedCountryCode] = useState("");
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const loginPath = useMemo(() => {
        const params = new URLSearchParams();
        if (safeReturnTo) {
            params.set("returnTo", safeReturnTo);
        }

        params.set("email", "1");

        return `/login?${params.toString()}`;
    }, [safeReturnTo]);

    /**
     * 解析认证后的目标地址, 并在浏览器中跳转
     */
    async function gotoPostAuthDestination() {
        const nextPath = await resolvePostAuthDestination(locale, safeReturnTo);
        window.location.assign(nextPath);
    }

    /**
     * 提交忘记密码请求, 然后切换到重置阶段
     *
     * @param values 请求表单值
     */
    async function submitRequest(values: RequestCodeFormValues) {
        setAlertMessage(null);
        setStatusMessage(null);

        try {
            await requestBff("/api/bff/auth/password/forgot", {
                method: "POST",
                body: JSON.stringify({
                    account: values.account,
                    country_code: values.countryCode || null,
                }),
            });

            setSubmittedAccount(values.account);
            setSubmittedCountryCode(values.countryCode || "");
            setPhase("reset");
            setStatusMessage(t("messages.requestAccepted"));
            resetForm.reset();
        } catch (error) {
            if (error instanceof BffRequestError && error.status === 429) {
                setAlertMessage(t("errors.tooManyRequests"));
                return;
            }

            if (error instanceof BffRequestError) {
                setAlertMessage(error.message || t("errors.requestFailed"));
                return;
            }

            setAlertMessage(t("errors.network"));
        }
    }

    /**
     * 提交重置密码请求, 成功后跳转
     *
     * @param values 重置表单值
     */
    async function submitReset(values: ResetPasswordFormValues) {
        if (!submittedAccount) {
            setAlertMessage(t("errors.accountRequired"));
            return;
        }

        setAlertMessage(null);
        setStatusMessage(null);

        try {
            await requestBff("/api/bff/auth/password/reset", {
                method: "POST",
                body: JSON.stringify({
                    account: submittedAccount,
                    country_code: submittedCountryCode || null,
                    code: values.code,
                    new_password: values.newPassword,
                }),
            });

            await gotoPostAuthDestination();
        } catch (error) {
            if (error instanceof BffRequestError && error.status === 422) {
                resetForm.setError("code", {message: t("errors.codeInvalid")});
                return;
            }

            if (error instanceof BffRequestError && error.status === 429) {
                setAlertMessage(t("errors.tooManyRequests"));
                return;
            }

            if (error instanceof BffRequestError) {
                setAlertMessage(error.message || t("errors.resetFailed"));
                return;
            }

            setAlertMessage(t("errors.network"));
        }
    }

    const isBusy = requestForm.formState.isSubmitting || resetForm.formState.isSubmitting;

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
                        <TriangleAlert className="size-4"/>
                        <AlertTitle>{t("messages.statusUpdate")}</AlertTitle>
                        <AlertDescription>{statusMessage}</AlertDescription>
                    </Alert>
                ) : null}

                {phase === "request" ? (
                    <form className="space-y-4" onSubmit={requestForm.handleSubmit(submitRequest)}>
                        <div className="space-y-2">
                            <Label htmlFor="account">{t("fields.account")}</Label>
                            <Input
                                id="account"
                                autoComplete="username"
                                placeholder={t("fields.accountPlaceholder")}
                                disabled={isBusy}
                                {...requestForm.register("account")}
                            />
                            {requestForm.formState.errors.account ? (
                                <p className="text-xs text-destructive">{requestForm.formState.errors.account.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="countryCode">{t("fields.countryCode")}</Label>
                            <Input
                                id="countryCode"
                                placeholder={t("fields.countryCodePlaceholder")}
                                disabled={isBusy}
                                {...requestForm.register("countryCode")}
                            />
                        </div>

                        <Button type="submit" className="h-11 w-full" disabled={isBusy}>
                            {requestForm.formState.isSubmitting ? (
                                <>
                                    <LoaderCircle className="size-4 animate-spin"/>
                                    {t("actions.sending")}
                                </>
                            ) : (
                                t("actions.sendCode")
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1 rounded-xl border border-border bg-secondary/40 p-3">
                            <p className="text-sm font-medium text-foreground">{t("reset.accountLabel")}</p>
                            <p className="text-sm text-muted-foreground">{submittedAccount}</p>
                        </div>

                        <form className="space-y-4" onSubmit={resetForm.handleSubmit(submitReset)}>
                            <div className="space-y-2">
                                <Label htmlFor="code">{t("fields.code")}</Label>
                                <Input
                                    id="code"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder={t("fields.codePlaceholder")}
                                    disabled={isBusy}
                                    {...resetForm.register("code")}
                                />
                                {resetForm.formState.errors.code ? (
                                    <p className="text-xs text-destructive">{resetForm.formState.errors.code.message}</p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">{t("fields.newPassword")}</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder={t("fields.newPasswordPlaceholder")}
                                    disabled={isBusy}
                                    {...resetForm.register("newPassword")}
                                />
                                {resetForm.formState.errors.newPassword ? (
                                    <p className="text-xs text-destructive">{resetForm.formState.errors.newPassword.message}</p>
                                ) : null}
                            </div>

                            <Button type="submit" className="h-11 w-full" disabled={isBusy}>
                                {resetForm.formState.isSubmitting ? (
                                    <>
                                        <LoaderCircle className="size-4 animate-spin"/>
                                        {t("actions.resetting")}
                                    </>
                                ) : (
                                    t("actions.resetPassword")
                                )}
                            </Button>
                        </form>

                        <Button type="button" variant="outline" className="h-9" onClick={() => setPhase("request")}
                                disabled={isBusy}>
                            {t("actions.changeAccount")}
                        </Button>
                    </div>
                )}
            </CardContent>
            <CardFooter className="justify-center border-t border-border bg-secondary/30 p-4 text-sm">
                <Button asChild variant="link" className="h-auto px-0 py-0 text-sm">
                    <Link href={loginPath}>{t("footer.backToLogin")}</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
