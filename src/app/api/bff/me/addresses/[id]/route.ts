import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 地址详情
 *
 * 映射, `GET /api/bff/me/addresses/{id}` -> `GET /api/v1/users/me/addresses/{id}`
 *
 * @param request Next 请求对象
 * @param context 路由上下文
 * @returns 统一 Result 响应
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${id}`,
        method: "GET",
    });
}

/**
 * BFF, 更新地址
 *
 * 映射, `PATCH /api/bff/me/addresses/{id}` -> `PATCH /api/v1/users/me/addresses/{id}`
 *
 * @param request Next 请求对象
 * @param context 路由上下文
 * @returns 统一 Result 响应
 */
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${id}`,
        method: "PATCH",
        includeBody: true,
    });
}

/**
 * BFF, 删除地址
 *
 * 映射, `DELETE /api/bff/me/addresses/{id}` -> `DELETE /api/v1/users/me/addresses/{id}`
 *
 * @param request Next 请求对象
 * @param context 路由上下文
 * @returns 统一 Result 响应
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${id}`,
        method: "DELETE",
        includeBody: false,
    });
}
