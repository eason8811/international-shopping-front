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
 * BFF: 解绑 OAuth 登录方式
 *
 * 映射: `DELETE /api/bff/account/bindings/{provider}` -> `DELETE /api/v1/users/me/bindings/{provider}`
 *
 * @param request Next 请求对象
 * @param context 路由参数上下文
 * @returns 统一 `Result` 响应
 */
export async function DELETE(request: NextRequest, context: ProviderRouteContext) {
    const {provider} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/bindings/${encodeURIComponent(provider)}`,
        method: "DELETE",
        requireCsrf: true,
        includeBody: false,
    });
}
