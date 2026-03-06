"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useTranslations} from "next-intl";
import {useEffect, useMemo, useState} from "react";
import {useForm} from "react-hook-form";

import {getEmailStatus, resendActivation, verifyEmail} from "@/features/auth/api";
import {verifyEmailSchema, type VerifyEmailSchema} from "@/features/auth/schemas";
import {useRouter} from "@/i18n/navigation";
import {FrontendApiError} from "@/lib/api/frontend";
import {safeRedirectPath} from "@/lib/url";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

/**
 * 注册激活表单入参
 */
interface RegisterVerifyFormProps {
    /** 待激活邮箱 */
    email?: string;
    /** 激活成功后的跳转目标 */
    redirectTo?: string;
}

/**
 * 注册激活表单, 包含邮件状态轮询, 验证码提交, 重发激活邮件
 *
 * @param props 组件入参
 * @returns 激活表单节点
 */
export function RegisterVerifyForm({email, redirectTo}: RegisterVerifyFormProps) {
    const t = useTranslations("AuthRegisterVerify");
    const router = useRouter();
    const [statusText, setStatusText] = useState<string>(t("status.pending"));
    const [statusLoading, setStatusLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [resendPending, setResendPending] = useState(false);
    const safeRedirect = safeRedirectPath(redirectTo, "/me/account");

    const form = useForm<VerifyEmailSchema>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: {
            email: email ?? "",
            code: "",
        },
    });

    /**
     * 轮询邮件状态
     */
    const pollEmailStatus = async () => {
        if (!email) {
            return;
        }

        try {
            setStatusLoading(true);
            const result = await getEmailStatus(email);
            if (!result?.status) {
                setStatusText(t("status.pending"));
                return;
            }

            setStatusText(result.status);
        } catch {
            setStatusText(t("status.pending"));
        } finally {
            setStatusLoading(false);
        }
    };

    useEffect(() => {
        void pollEmailStatus();

        const timer = setInterval(() => {
            void pollEmailStatus();
        }, 6000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    const statusVariant = useMemo(() => {
        if (statusText.toUpperCase() === "DELIVERED") {
            return "default" as const;
        }

        if (statusText.toUpperCase() === "FAILED" || statusText.toUpperCase() === "BOUNCED") {
            return "destructive" as const;
        }

        return "secondary" as const;
    }, [statusText]);

    /**
     * 提交验证码激活
     *
     * @param values 表单值
     */
    const onSubmit = form.handleSubmit(async (values) => {
        setErrorText(null);

        try {
            await verifyEmail(values);
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
     * 重发激活邮件
     */
    const handleResend = async () => {
        if (!email) {
            setErrorText(t("errors.emailMissing"));
            return;
        }

        setErrorText(null);
        setResendPending(true);

        try {
            await resendActivation(email);
            await pollEmailStatus();
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setErrorText(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
            } else {
                setErrorText(t("errors.unknown"));
            }
        } finally {
            setResendPending(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">{t("emailLabel")}</p>
                <p className="font-medium text-foreground">{email || "-"}</p>
                <div className="mt-2 flex items-center gap-2">
                    <Badge variant={statusVariant}>{statusText}</Badge>
                    {statusLoading ? <span className="text-xs text-muted-foreground">{t("status.refreshing")}</span> : null}
                </div>
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
                <input type="hidden" {...form.register("email")}/>
                <div className="space-y-2">
                    <Label htmlFor="verify-code">{t("fields.code")}</Label>
                    <Input
                        id="verify-code"
                        placeholder={t("placeholders.code")}
                        autoComplete="one-time-code"
                        {...form.register("code")}
                    />
                    {form.formState.errors.code ? <p className="text-xs text-destructive">{t("errors.code")}</p> : null}
                </div>
                {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || resendPending}>
                    {form.formState.isSubmitting ? t("actions.verifying") : t("actions.verify")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={form.formState.isSubmitting || resendPending}
                >
                    {resendPending ? t("actions.resending") : t("actions.resend")}
                </Button>
            </form>
        </div>
    );
}
