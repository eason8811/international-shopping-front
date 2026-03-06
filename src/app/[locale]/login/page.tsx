import {getTranslations} from "next-intl/server";

import {LoginForm} from "@/features/auth/components/login-form";
import {AuthShell} from "@/features/auth/components/auth-shell";
import {Link} from "@/i18n/navigation";

/**
 * 登录页入参
 */
interface LoginPageProps {
    /** 查询参数, redirect 用于登录成功后跳回原目标 */
    searchParams: Promise<{ redirect?: string }>;
}

/**
 * 登录页
 *
 * @param props 页面入参
 * @returns 登录页节点
 */
export default async function LoginPage({searchParams}: LoginPageProps) {
    const t = await getTranslations("AuthLogin");
    const {redirect} = await searchParams;

    return (
        <AuthShell
            title={t("title")}
            description={t("description")}
            footer={(
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href="/register" className="font-medium text-foreground hover:underline">
                        {t("links.register")}
                    </Link>
                    <Link href="/forgot-password" className="font-medium text-foreground hover:underline">
                        {t("links.forgotPassword")}
                    </Link>
                </div>
            )}
        >
            <LoginForm redirectTo={redirect}/>
        </AuthShell>
    );
}
