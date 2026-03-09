import {OAuthCallbackPanel} from "@/features/auth/components/oauth-callback-panel";

/**
 * 回调页属性, 包含 provider, intent 和回调查询参数
 */
interface OAuthCallbackPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{
        provider?: string;
        intent?: string;
        returnTo?: string;
        code?: string;
        state?: string;
        error?: string;
        error_description?: string;
    }>;
}

/**
 * 渲染 OAuth 回调页, 将查询参数透传给回调面板
 *
 * @param props 回调页属性
 * @returns 回调页视图
 */
export default async function OAuthCallbackPage({params, searchParams}: OAuthCallbackPageProps) {
    const {locale} = await params;
    const query = await searchParams;

    return (
        <OAuthCallbackPanel
            locale={locale}
            provider={query.provider}
            intent={query.intent}
            returnTo={query.returnTo}
            code={query.code}
            state={query.state}
            error={query.error}
            errorDescription={query.error_description}
        />
    );
}
