import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * 代理重发激活邮件请求到后端端点
 *
 * @param request Next 请求对象
 * @returns 规范化后的结果响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/resend-activation",
        method: "POST",
        requireCsrf: false,
    });
}
