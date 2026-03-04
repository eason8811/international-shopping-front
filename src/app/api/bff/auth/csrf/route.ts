import type { NextRequest } from "next/server";

import { proxyBffRequest } from "@/lib/api/bff";

/**
 * BFF: 获取 CSRF token
 *
 * 映射：`GET /api/bff/auth/csrf` -> `GET /api/v1/auth/csrf`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应，透传后端 `Set-Cookie`
 */
export async function GET(request: NextRequest) {
  return proxyBffRequest(request, {
    backendPath: "/auth/csrf",
    method: "GET",
    requireCsrf: false,
    includeBody: false,
  });
}
