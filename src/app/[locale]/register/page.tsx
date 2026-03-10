import {cookies} from "next/headers";
import {getTranslations} from "next-intl/server";
import {redirect} from "next/navigation";

import {sanitizeInternalPath, toLocalizedPath} from "@/features/auth/api/client";
import {AuthPageShell} from "@/features/auth/components/auth-page-shell";
import {RegisterPanel} from "@/features/auth/components/register-panel";

/**
 * 注册页属性, 包含 locale 参数和注册流程查询参数
 */
interface RegisterPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{
        returnTo?: string;
        step?: string;
        email?: string;
    }>;
}

/**
 * 渲染注册页, 已认证用户会跳到账户页或请求路径
 *
 * @param props 注册页属性
 * @returns 注册页视图
 */
export default async function RegisterPage({params, searchParams}: RegisterPageProps) {
    const {locale} = await params;
    const search = await searchParams;
    const t = await getTranslations({locale, namespace: "AuthRegisterPage"});

    const cookieStore = await cookies();
    const hasAuthCookie = Boolean(cookieStore.get("access_token")?.value || cookieStore.get("refresh_token")?.value);

    const safeReturnTo = sanitizeInternalPath(search.returnTo);
    if (hasAuthCookie) {
        redirect(safeReturnTo ?? toLocalizedPath(locale, "/account"));
    }

    return (
        <AuthPageShell
            eyebrow={t("shell.eyebrow")}
            title={t("shell.title")}
            description={t("shell.description")}
            highlights={[
                t("shell.highlights.orders"),
                t("shell.highlights.addresses"),
                t("shell.highlights.support"),
            ]}
            panelMaxWidthClassName="max-w-full md:max-w-[560px]"
            mobileSummaryVariant="title"
            mobileHighlightCount={1}
        >
            <RegisterPanel
                locale={locale}
                returnTo={safeReturnTo ?? undefined}
                initialEmail={search.email}
                startInVerify={search.step === "verify"}
            />
        </AuthPageShell>
    );
}
