import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 当前用户地址列表与创建
 *
 * 映射, `GET|POST /api/bff/users/me/addresses` -> `GET|POST /api/v1/users/me/addresses`
 */
export async function GET(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me/addresses",
        method: "GET",
        requireCsrf: false,
        includeBody: false,
    });
}

/**
 * BFF, 新增当前用户地址
 *
 * 映射, `POST /api/bff/users/me/addresses` -> `POST /api/v1/users/me/addresses`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me/addresses",
        method: "POST",
        requireCsrf: true,
        includeBody: true,
        idempotent: true,
    });
}
