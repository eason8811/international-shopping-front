import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 当前用户账户信息
 *
 * 映射, `GET|PATCH /api/bff/users/me` -> `GET|PATCH /api/v1/users/me`
 */
export async function GET(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me",
        method: "GET",
        requireCsrf: false,
        includeBody: false,
    });
}

/**
 * BFF, 更新当前用户账户信息
 *
 * 映射, `PATCH /api/bff/users/me` -> `PATCH /api/v1/users/me`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应
 */
export async function PATCH(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me",
        method: "PATCH",
        requireCsrf: true,
        includeBody: true,
    });
}
