import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * 提供方路由参数
 */
interface ProviderRouteContext {
    /** 路由参数 */
    params: Promise<{ provider: string }>;
}

/**
 * BFF: 发起 OAuth 绑定授权
 *
 * 映射: `GET /api/bff/account/bindings/{provider}/authorize` -> `GET /api/v1/users/me/bindings/{provider}/authorize`
 *
 * @param request Next 请求对象
 * @param context 路由参数上下文
 * @returns 统一 `Result` 响应
 */
export async function GET(request: NextRequest, context: ProviderRouteContext) {
    const {provider} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/bindings/${encodeURIComponent(provider)}/authorize`,
        method: "GET",
        requireCsrf: true,
        includeBody: false,
    });
}
