import type { NextRequest } from "next/server";

import { proxyBffRequest } from "@/lib/api/bff";

/**
 * 代理刷新令牌请求到后端端点
 *
 * @param request Next 请求对象
 * @returns 规范化后的结果响应, 并透传后端 `Set-Cookie`
 */
export async function POST(request: NextRequest) {
  return proxyBffRequest(request, {
    backendPath: "/auth/refresh-token",
    method: "POST",
    requireCsrf: false,
    includeBody: false,
  });
}
