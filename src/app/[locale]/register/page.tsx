import {getTranslations} from "next-intl/server";

import {RegisterForm} from "@/features/auth/components/register-form";
import {RegisterShell} from "@/features/auth/components/register-shell";
import {Link} from "@/i18n/navigation";

/**
 * 注册页入参
 */
interface RegisterPageProps {
    /** 查询参数, redirect 用于激活后跳转 */
    searchParams: Promise<{ redirect?: string }>;
}

/**
 * 注册页
 *
 * @param props 页面入参
 * @returns 注册页节点
 */
export default async function RegisterPage({searchParams}: RegisterPageProps) {
    const t = await getTranslations("AuthRegister");
    const {redirect} = await searchParams;

    return (
        <RegisterShell
            title={t("title")}
            description={t("description")}
            footer={(
                <div className="text-center">
                    <Link href="/login" className="font-medium text-foreground hover:underline">
                        {t("links.login")}
                    </Link>
                </div>
            )}
        >
            <RegisterForm redirectTo={redirect}/>
        </RegisterShell>
    );
}
