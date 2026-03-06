import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 设为默认地址
 *
 * 映射, `POST /api/bff/me/addresses/{id}/set-default` -> `POST /api/v1/users/me/addresses/{id}/set-default`
 *
 * @param request Next 请求对象
 * @param context 路由上下文
 * @returns 统一 Result 响应
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${id}/set-default`,
        method: "POST",
        includeBody: false,
    });
}
