import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * 动态路由参数
 */
interface AddressDefaultRouteContext {
    /** 地址 ID */
    params: Promise<{id: string}>;
}

/**
 * BFF, 设为默认地址
 *
 * 映射, `POST /api/bff/users/me/addresses/[id]/set-default` -> `POST /api/v1/users/me/addresses/{id}/set-default`
 *
 * @param request Next 请求对象
 * @param context 动态路由参数
 * @returns 统一 `Result` 响应
 */
export async function POST(request: NextRequest, context: AddressDefaultRouteContext) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${encodeURIComponent(id)}/set-default`,
        method: "POST",
        requireCsrf: true,
        includeBody: false,
    });
}
