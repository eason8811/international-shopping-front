import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * 地址路由参数
 */
interface AddressRouteContext {
    /** 路由参数 */
    params: Promise<{ id: string }>;
}

/**
 * BFF: 设为默认地址
 *
 * 映射: `POST /api/bff/account/addresses/{id}/set-default` -> `POST /api/v1/users/me/addresses/{id}/set-default`
 *
 * @param request Next 请求对象
 * @param context 路由参数上下文
 * @returns 统一 `Result` 响应
 */
export async function POST(request: NextRequest, context: AddressRouteContext) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${encodeURIComponent(id)}/set-default`,
        method: "POST",
        requireCsrf: true,
        includeBody: false,
    });
}
