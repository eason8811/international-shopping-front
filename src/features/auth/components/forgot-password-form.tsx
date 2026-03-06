"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useTranslations} from "next-intl";
import {useState} from "react";
import {useForm} from "react-hook-form";

import {forgotPassword, resetPassword} from "@/features/auth/api";
import {
    forgotPasswordSchema,
    resetPasswordSchema,
    type ForgotPasswordSchema,
    type ResetPasswordSchema,
} from "@/features/auth/schemas";
import {useRouter} from "@/i18n/navigation";
import {FrontendApiError} from "@/lib/api/frontend";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

/**
 * 找回密码表单组件
 *
 * @returns 找回密码表单节点
 */
export function ForgotPasswordForm() {
    const t = useTranslations("AuthForgotPassword");
    const router = useRouter();
    const [errorText, setErrorText] = useState<string | null>(null);
    const [codeSent, setCodeSent] = useState(false);

    const sendForm = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            account: "",
            country_code: "",
        },
    });

    const resetForm = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            account: "",
            code: "",
            new_password: "",
            country_code: "",
        },
    });

    /**
     * 提交发送验证码
     *
     * @param values 表单值
     */
    const onSendCode = sendForm.handleSubmit(async (values) => {
        setErrorText(null);

        try {
            await forgotPassword(values);
            setCodeSent(true);
            resetForm.setValue("account", values.account);
            resetForm.setValue("country_code", values.country_code ?? "");
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setErrorText(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
                return;
            }

            setErrorText(t("errors.unknown"));
        }
    });

    /**
     * 提交重置密码
     *
     * @param values 表单值
     */
    const onResetPassword = resetForm.handleSubmit(async (values) => {
        setErrorText(null);

        try {
            await resetPassword(values);
            router.push("/me/account");
            router.refresh();
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setErrorText(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
                return;
            }

            setErrorText(t("errors.unknown"));
        }
    });

    return (
        <div className="space-y-4">
            {codeSent ? <Badge>{t("status.codeSent")}</Badge> : null}
            {!codeSent ? (
                <form className="space-y-4" onSubmit={onSendCode}>
                    <div className="space-y-2">
                        <Label htmlFor="forgot-account">{t("fields.account")}</Label>
                        <Input
                            id="forgot-account"
                            placeholder={t("placeholders.account")}
                            {...sendForm.register("account")}
                        />
                        {sendForm.formState.errors.account ? (
                            <p className="text-xs text-destructive">{t("errors.account")}</p>
                        ) : null}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="forgot-country-code">{t("fields.countryCode")}</Label>
                        <Input
                            id="forgot-country-code"
                            placeholder={t("placeholders.countryCode")}
                            {...sendForm.register("country_code")}
                        />
                    </div>
                    {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}
                    <Button type="submit" className="w-full" disabled={sendForm.formState.isSubmitting}>
                        {sendForm.formState.isSubmitting ? t("actions.sending") : t("actions.sendCode")}
                    </Button>
                </form>
            ) : (
                <form className="space-y-4" onSubmit={onResetPassword}>
                    <input type="hidden" {...resetForm.register("account")}/>
                    <input type="hidden" {...resetForm.register("country_code")}/>
                    <div className="space-y-2">
                        <Label htmlFor="reset-code">{t("fields.code")}</Label>
                        <Input
                            id="reset-code"
                            placeholder={t("placeholders.code")}
                            autoComplete="one-time-code"
                            {...resetForm.register("code")}
                        />
                        {resetForm.formState.errors.code ? <p className="text-xs text-destructive">{t("errors.code")}</p> : null}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reset-new-password">{t("fields.newPassword")}</Label>
                        <Input
                            id="reset-new-password"
                            type="password"
                            placeholder={t("placeholders.newPassword")}
                            autoComplete="new-password"
                            {...resetForm.register("new_password")}
                        />
                        {resetForm.formState.errors.new_password ? (
                            <p className="text-xs text-destructive">{t("errors.newPassword")}</p>
                        ) : null}
                    </div>
                    {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}
                    <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
                        {resetForm.formState.isSubmitting ? t("actions.resetting") : t("actions.resetPassword")}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            setCodeSent(false);
                            setErrorText(null);
                        }}
                    >
                        {t("actions.back")}
                    </Button>
                </form>
            )}
        </div>
    );
}
