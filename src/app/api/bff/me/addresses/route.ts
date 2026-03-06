import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 地址列表
 *
 * 映射, `GET /api/bff/me/addresses` -> `GET /api/v1/users/me/addresses`
 *
 * @param request Next 请求对象
 * @returns 统一 Result 响应
 */
export async function GET(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me/addresses",
        method: "GET",
    });
}

/**
 * BFF, 新增地址
 *
 * 映射, `POST /api/bff/me/addresses` -> `POST /api/v1/users/me/addresses`
 *
 * @param request Next 请求对象
 * @returns 统一 Result 响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me/addresses",
        method: "POST",
        idempotent: true,
    });
}
