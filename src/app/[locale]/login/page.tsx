import {cookies} from "next/headers";
import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {sanitizeInternalPath, toLocalizedPath} from "@/features/auth/api/client";
import {AuthPageShell} from "@/features/auth/components/auth-page-shell";
import {LoginPanel} from "@/features/auth/components/login-panel";

/**
 * 登录页属性, 包含 locale 参数和重定向查询参数
 */
interface LoginPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{
        redirect?: string;
        returnTo?: string;
        email?: string;
    }>;
}

/**
 * 渲染登录页, 已认证用户会跳到账户页或请求路径
 *
 * @param props 登录页属性
 * @returns 登录页视图
 */
export default async function LoginPage({params, searchParams}: LoginPageProps) {
    const {locale} = await params;
    const search = await searchParams;
    const t = await getTranslations({locale, namespace: "AuthLoginPage"});

    const cookieStore = await cookies();
    const hasAuthCookie = Boolean(cookieStore.get("access_token")?.value || cookieStore.get("refresh_token")?.value);

    const safeReturnTo = sanitizeInternalPath(search.returnTo ?? search.redirect);
    if (hasAuthCookie) {
        redirect(safeReturnTo ?? toLocalizedPath(locale, "/account"));
    }

    return (
        <AuthPageShell
            eyebrow={t("shell.eyebrow")}
            title={t("shell.title")}
            description={t("shell.description")}
            highlights={[
                t("shell.highlights.fast"),
                t("shell.highlights.track"),
                t("shell.highlights.secure"),
            ]}
            panelMaxWidthClassName="max-w-full md:max-w-[560px]"
            mobileSummaryVariant="highlights"
        >
            <LoginPanel
                locale={locale}
                returnTo={safeReturnTo ?? undefined}
                expandEmail={search.email === "1"}
            />
        </AuthPageShell>
    );
}
