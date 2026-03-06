import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 获取当前用户资料
 *
 * 映射, `GET /api/bff/me/profile` -> `GET /api/v1/users/me/profile`
 *
 * @param request Next 请求对象
 * @returns 统一 Result 响应
 */
export async function GET(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me/profile",
        method: "GET",
    });
}

/**
 * BFF, 更新当前用户资料
 *
 * 映射, `PATCH /api/bff/me/profile` -> `PATCH /api/v1/users/me/profile`
 *
 * @param request Next 请求对象
 * @returns 统一 Result 响应
 */
export async function PATCH(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me/profile",
        method: "PATCH",
        includeBody: true,
    });
}
