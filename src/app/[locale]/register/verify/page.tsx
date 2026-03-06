import {getTranslations} from "next-intl/server";

import {RegisterVerifyForm} from "@/features/auth/components/register-verify-form";
import {AuthShell} from "@/features/auth/components/auth-shell";
import {Link} from "@/i18n/navigation";

/**
 * 注册激活页入参
 */
interface RegisterVerifyPageProps {
    /** 查询参数, email 为激活邮箱, redirect 为激活后跳转 */
    searchParams: Promise<{ email?: string; redirect?: string }>;
}

/**
 * 注册激活页
 *
 * @param props 页面入参
 * @returns 注册激活页节点
 */
export default async function RegisterVerifyPage({searchParams}: RegisterVerifyPageProps) {
    const t = await getTranslations("AuthRegisterVerify");
    const {email, redirect} = await searchParams;

    return (
        <AuthShell
            title={t("title")}
            description={t("description")}
            footer={(
                <div className="text-center">
                    <Link href="/register" className="font-medium text-foreground hover:underline">
                        {t("links.backRegister")}
                    </Link>
                </div>
            )}
        >
            <RegisterVerifyForm email={email} redirectTo={redirect}/>
        </AuthShell>
    );
}
