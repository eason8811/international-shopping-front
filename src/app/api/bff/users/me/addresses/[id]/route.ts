import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * 动态路由参数
 */
interface AddressRouteContext {
    /** 地址 ID */
    params: Promise<{id: string}>;
}

/**
 * BFF, 当前用户单个地址详情
 *
 * 映射, `GET /api/bff/users/me/addresses/[id]` -> `GET /api/v1/users/me/addresses/{id}`
 *
 * @param request Next 请求对象
 * @param context 动态路由参数
 * @returns 统一 `Result` 响应
 */
export async function GET(request: NextRequest, context: AddressRouteContext) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${encodeURIComponent(id)}`,
        method: "GET",
        requireCsrf: false,
        includeBody: false,
    });
}

/**
 * BFF, 更新当前用户单个地址
 *
 * 映射, `PATCH /api/bff/users/me/addresses/[id]` -> `PATCH /api/v1/users/me/addresses/{id}`
 *
 * @param request Next 请求对象
 * @param context 动态路由参数
 * @returns 统一 `Result` 响应
 */
export async function PATCH(request: NextRequest, context: AddressRouteContext) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${encodeURIComponent(id)}`,
        method: "PATCH",
        requireCsrf: true,
        includeBody: true,
    });
}

/**
 * BFF, 删除当前用户单个地址
 *
 * 映射, `DELETE /api/bff/users/me/addresses/[id]` -> `DELETE /api/v1/users/me/addresses/{id}`
 *
 * @param request Next 请求对象
 * @param context 动态路由参数
 * @returns 统一 `Result` 响应
 */
export async function DELETE(request: NextRequest, context: AddressRouteContext) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${encodeURIComponent(id)}`,
        method: "DELETE",
        requireCsrf: true,
        includeBody: false,
    });
}
