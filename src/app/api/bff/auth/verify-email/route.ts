import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 校验邮箱验证码并激活账户
 *
 * 映射, `POST /api/bff/auth/verify-email` -> `POST /api/v1/auth/verify-email`
 *
 * @param request Next 请求对象
 * @returns 统一 Result 响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/verify-email",
        method: "POST",
    });
}
