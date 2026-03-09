import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF: 本地账号密码登录
 *
 * 映射: `POST /api/bff/auth/login` -> `POST /api/v1/auth/login`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应, 透传后端 `Set-Cookie`
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/login",
        method: "POST",
    });
}
