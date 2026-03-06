import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 查询激活邮件投递状态
 *
 * 映射, `GET /api/bff/auth/email-status` -> `GET /api/v1/auth/email-status`
 *
 * @param request Next 请求对象
 * @returns 统一 Result 响应
 */
export async function GET(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/email-status",
        method: "GET",
        requireCsrf: false,
        includeBody: false,
    });
}
