import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * OAuth2 Provider 路由参数
 */
interface ProviderRouteContext {
    /** 路由参数 */
    params: Promise<{ provider: string }>;
}

/**
 * BFF: OAuth2 登录回调
 *
 * 映射: `GET /api/bff/auth/oauth2/{provider}/callback` -> `GET /api/v1/oauth2/{provider}/callback`
 *
 * @param request Next 请求对象
 * @param context 路由参数上下文
 * @returns 统一 `Result` 响应, 透传后端 `Set-Cookie`
 */
export async function GET(request: NextRequest, context: ProviderRouteContext) {
    const {provider} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/oauth2/${encodeURIComponent(provider)}/callback`,
        method: "GET",
        requireCsrf: false,
        includeBody: false,
    });
}
