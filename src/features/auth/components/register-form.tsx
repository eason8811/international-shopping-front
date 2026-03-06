"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useTranslations} from "next-intl";
import {useState} from "react";
import {useForm} from "react-hook-form";

import {register as registerUser} from "@/features/auth/api";
import {registerSchema, type RegisterSchema} from "@/features/auth/schemas";
import {useRouter} from "@/i18n/navigation";
import {buildQueryString, FrontendApiError} from "@/lib/api/frontend";
import {safeRedirectPath} from "@/lib/url";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

/**
 * 注册表单组件入参
 */
interface RegisterFormProps {
    /** 激活成功后的跳转目标 */
    redirectTo?: string;
}

/**
 * 注册表单, 默认仅展示最小必填字段, 手机号按需展开
 *
 * @param props 组件入参
 * @returns 注册表单节点
 */
export function RegisterForm({redirectTo}: RegisterFormProps) {
    const t = useTranslations("AuthRegister");
    const router = useRouter();
    const [errorText, setErrorText] = useState<string | null>(null);
    const [showPhoneFields, setShowPhoneFields] = useState(false);
    const safeRedirect = safeRedirectPath(redirectTo, "/me/account");

    const form = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            nickname: "",
            email: "",
            password: "",
            phone_country_code: "",
            phone_national_number: "",
        },
    });

    /**
     * 提交注册
     *
     * @param values 表单值
     */
    const onSubmit = form.handleSubmit(async (values) => {
        setErrorText(null);

        try {
            await registerUser(values);
            router.push(
                `/register/verify${buildQueryString({
                    email: values.email,
                    redirect: safeRedirect,
                })}`,
            );
        } catch (error) {
            if (error instanceof FrontendApiError) {
                setErrorText(`${error.message}${error.traceId ? ` (trace: ${error.traceId})` : ""}`);
                return;
            }

            setErrorText(t("errors.unknown"));
        }
    });

    return (
        <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="register-username">{t("fields.username")}</Label>
                    <Input
                        id="register-username"
                        className="h-12 bg-muted/40"
                        placeholder={t("placeholders.username")}
                        autoComplete="username"
                        {...form.register("username")}
                    />
                    {form.formState.errors.username ? (
                        <p className="text-xs text-destructive">{t("errors.username")}</p>
                    ) : null}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="register-nickname">{t("fields.nickname")}</Label>
                    <Input
                        id="register-nickname"
                        className="h-12 bg-muted/40"
                        placeholder={t("placeholders.nickname")}
                        autoComplete="nickname"
                        {...form.register("nickname")}
                    />
                    {form.formState.errors.nickname ? (
                        <p className="text-xs text-destructive">{t("errors.nickname")}</p>
                    ) : null}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-email">{t("fields.email")}</Label>
                <Input
                    id="register-email"
                    type="email"
                    className="h-12 bg-muted/40"
                    placeholder={t("placeholders.email")}
                    autoComplete="email"
                    {...form.register("email")}
                />
                {form.formState.errors.email ? (
                    <p className="text-xs text-destructive">{t("errors.email")}</p>
                ) : null}
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-password">{t("fields.password")}</Label>
                <Input
                    id="register-password"
                    type="password"
                    className="h-12 bg-muted/40"
                    placeholder={t("placeholders.password")}
                    autoComplete="new-password"
                    {...form.register("password")}
                />
                {form.formState.errors.password ? (
                    <p className="text-xs text-destructive">{t("errors.password")}</p>
                ) : null}
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/25 p-3">
                <button
                    type="button"
                    className="cursor-pointer text-xs font-medium text-foreground transition-colors hover:text-foreground/80"
                    onClick={() => setShowPhoneFields((prev) => !prev)}
                >
                    {showPhoneFields ? t("actions.hideOptional") : t("actions.showOptional")}
                </button>
                {showPhoneFields ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="register-phone-country">{t("fields.phoneCountry")}</Label>
                            <Input
                                id="register-phone-country"
                                className="h-11 bg-background"
                                placeholder={t("placeholders.phoneCountry")}
                                {...form.register("phone_country_code")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="register-phone">{t("fields.phone")}</Label>
                            <Input
                                id="register-phone"
                                className="h-11 bg-background"
                                placeholder={t("placeholders.phone")}
                                {...form.register("phone_national_number")}
                            />
                        </div>
                    </div>
                ) : null}
                {form.formState.errors.phone_country_code || form.formState.errors.phone_national_number ? (
                    <p className="text-xs text-destructive">{t("errors.phonePair")}</p>
                ) : null}
            </div>

            {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}
            <Button type="submit" className="h-12 w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t("actions.submitting") : t("actions.register")}
            </Button>
        </form>
    );
}
