import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 发起找回密码验证码发送
 *
 * 映射, `POST /api/bff/auth/password/forgot` -> `POST /api/v1/auth/password/forgot`
 *
 * @param request Next 请求对象
 * @returns 统一 Result 响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/password/forgot",
        method: "POST",
    });
}
