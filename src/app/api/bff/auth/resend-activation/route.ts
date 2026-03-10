import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF: 重发激活邮件
 *
 * 映射: `POST /api/bff/auth/resend-activation` -> `POST /api/v1/auth/resend-activation`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/resend-activation",
        method: "POST",
    });
}
