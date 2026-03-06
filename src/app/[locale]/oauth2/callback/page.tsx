import {getTranslations} from "next-intl/server";

import {OauthCallbackProbe} from "@/features/auth/components/oauth-callback-probe";
import {AuthShell} from "@/features/auth/components/auth-shell";

/**
 * OAuth 回调页入参
 */
interface OAuthCallbackPageProps {
    /** 查询参数, redirect 为最终跳转目标 */
    searchParams: Promise<{ redirect?: string }>;
}

/**
 * OAuth 回调承接页
 *
 * @param props 页面入参
 * @returns OAuth 回调页节点
 */
export default async function OAuthCallbackPage({searchParams}: OAuthCallbackPageProps) {
    const t = await getTranslations("AuthOauthCallback");
    const {redirect} = await searchParams;

    return (
        <AuthShell title={t("title")} description={t("description")}>
            <OauthCallbackProbe redirectTo={redirect}/>
        </AuthShell>
    );
}
