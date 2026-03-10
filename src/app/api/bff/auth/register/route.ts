import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * BFF, 用户注册
 *
 * 映射, `POST /api/bff/auth/register` -> `POST /api/v1/auth/register`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/register",
        method: "POST",
        requireCsrf: false,
        includeBody: true,
    });
}
