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
 * BFF: 地址详情
 *
 * 映射: `GET /api/bff/account/addresses/{id}` -> `GET /api/v1/users/me/addresses/{id}`
 *
 * @param request Next 请求对象
 * @param context 路由参数上下文
 * @returns 统一 `Result` 响应
 */
export async function GET(request: NextRequest, context: AddressRouteContext) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${encodeURIComponent(id)}`,
        method: "GET",
        requireCsrf: true,
        includeBody: false,
    });
}

/**
 * BFF: 更新地址
 *
 * 映射: `PATCH /api/bff/account/addresses/{id}` -> `PATCH /api/v1/users/me/addresses/{id}`
 *
 * @param request Next 请求对象
 * @param context 路由参数上下文
 * @returns 统一 `Result` 响应
 */
export async function PATCH(request: NextRequest, context: AddressRouteContext) {
    const {id} = await context.params;

    return proxyBffRequest(request, {
        backendPath: `/users/me/addresses/${encodeURIComponent(id)}`,
        method: "PATCH",
        requireCsrf: true,
    });
}

/**
 * BFF: 删除地址
 *
 * 映射: `DELETE /api/bff/account/addresses/{id}` -> `DELETE /api/v1/users/me/addresses/{id}`
 *
 * @param request Next 请求对象
 * @param context 路由参数上下文
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
