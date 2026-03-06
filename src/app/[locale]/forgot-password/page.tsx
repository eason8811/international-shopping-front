import {getTranslations} from "next-intl/server";

import {ForgotPasswordForm} from "@/features/auth/components/forgot-password-form";
import {AuthShell} from "@/features/auth/components/auth-shell";
import {Link} from "@/i18n/navigation";

/**
 * 找回密码页
 *
 * @returns 找回密码页节点
 */
export default async function ForgotPasswordPage() {
    const t = await getTranslations("AuthForgotPassword");

    return (
        <AuthShell
            title={t("title")}
            description={t("description")}
            footer={(
                <div className="text-center">
                    <Link href="/login" className="font-medium text-foreground hover:underline">
                        {t("links.backLogin")}
                    </Link>
                </div>
            )}
        >
            <ForgotPasswordForm/>
        </AuthShell>
    );
}
