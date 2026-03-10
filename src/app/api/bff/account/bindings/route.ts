import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF: 获取当前用户 OAuth 绑定列表
 *
 * 映射: `GET /api/bff/account/bindings` -> `GET /api/v1/users/me/bindings`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应
 */
export async function GET(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/users/me/bindings",
        method: "GET",
        requireCsrf: true,
        includeBody: false,
    });
}
