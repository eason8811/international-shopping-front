import type {NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * 代理本地注册请求到后端端点
 *
 * @param request Next 请求对象
 * @returns 规范化后的结果响应
 */
export async function POST(request: NextRequest) {
    return proxyBffRequest(request, {
        backendPath: "/auth/register",
        method: "POST",
        requireCsrf: false,
    });
}
