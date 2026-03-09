import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF: 提交新密码
 *
 * 映射: `POST /api/bff/auth/password/reset` -> `POST /api/v1/auth/password/reset`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应, 透传后端 `Set-Cookie`
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/password/reset",
        method: "POST",
    });
}
