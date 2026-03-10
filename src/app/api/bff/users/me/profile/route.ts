import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 当前用户资料
 *
 * 映射, `GET|PATCH /api/bff/users/me/profile` -> `GET|PATCH /api/v1/users/me/profile`
 */
export async function GET(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me/profile",
        method: "GET",
        requireCsrf: false,
        includeBody: false,
    });
}

/**
 * BFF, 更新当前用户资料
 *
 * 映射, `PATCH /api/bff/users/me/profile` -> `PATCH /api/v1/users/me/profile`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应
 */
export async function PATCH(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me/profile",
        method: "PATCH",
        requireCsrf: true,
        includeBody: true,
    });
}
