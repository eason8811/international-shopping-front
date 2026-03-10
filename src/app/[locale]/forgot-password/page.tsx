import {getTranslations} from "next-intl/server";

import {sanitizeInternalPath} from "@/features/auth/api/client";
import {AuthPageShell} from "@/features/auth/components/auth-page-shell";
import {ForgotPasswordPanel} from "@/features/auth/components/forgot-password-panel";

/**
 * 忘记密码页属性, 包含 locale 参数和回跳查询参数
 */
interface ForgotPasswordPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{
        returnTo?: string;
    }>;
}

/**
 * 渲染忘记密码页, 在同一路由中保持恢复流程
 *
 * @param props 忘记密码页属性
 * @returns 忘记密码页视图
 */
export default async function ForgotPasswordPage({params, searchParams}: ForgotPasswordPageProps) {
    const {locale} = await params;
    const search = await searchParams;
    const t = await getTranslations({locale, namespace: "AuthForgotPasswordPage"});

    return (
        <AuthPageShell
            eyebrow={t("shell.eyebrow")}
            title={t("shell.title")}
            description={t("shell.description")}
            highlights={[
                t("shell.highlights.recovery"),
                t("shell.highlights.security"),
                t("shell.highlights.resume"),
            ]}
            compactAside
            subtleAside
            padHighlightCount={2}
            panelMaxWidthClassName="max-w-full md:max-w-[560px]"
            mobileSummaryVariant="none"
        >
            <ForgotPasswordPanel locale={locale} returnTo={sanitizeInternalPath(search.returnTo) ?? undefined}/>
        </AuthPageShell>
    );
}
