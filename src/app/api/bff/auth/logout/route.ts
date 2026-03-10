import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 退出登录
 *
 * 映射, `POST /api/bff/auth/logout` -> `POST /api/v1/auth/logout`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/logout",
        method: "POST",
        requireCsrf: true,
        includeBody: false,
    });
}
