import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * 提供方路由上下文, 包含提供方路径参数
 */
interface ProviderRouteContext {
    params: Promise<{ provider: string }>;
}

/**
 * 代理 OAuth 绑定回调请求到后端端点
 *
 * @param request Next 请求对象
 * @param context 包含提供方值的路由上下文
 * @returns 规范化后的 BFF 响应
 */
export async function GET(request: NextRequest, context: ProviderRouteContext) {
    const {provider} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/bindings/oauth2/${encodeURIComponent(provider)}/callback`,
        method: "GET",
        requireCsrf: false,
        includeBody: false,
    });
}
