import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 校验验证码并重置密码
 *
 * 映射, `POST /api/bff/auth/password/reset` -> `POST /api/v1/auth/password/reset`
 *
 * @param request Next 请求对象
 * @returns 统一 Result 响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/password/reset",
        method: "POST",
    });
}
