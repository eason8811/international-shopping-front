import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * 代理邮箱验证请求到后端端点
 *
 * @param request Next 请求对象
 * @returns 规范化后的结果响应, 并透传后端 `Set-Cookie`
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/verify-email",
        method: "POST",
        requireCsrf: false,
    });
}
