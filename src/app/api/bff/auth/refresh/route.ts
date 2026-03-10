import type { NextRequest } from "next/server";

import { proxyBffRequest } from "@/lib/api/bff";

/**
 * BFF: 刷新登录令牌
 *
 * 映射：`POST /api/bff/auth/refresh` -> `POST /api/v1/auth/refresh-token`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应，透传后端 `Set-Cookie`
 */
export async function POST(request: NextRequest) {
  return proxyBffRequest(request, {
    backendPath: "/auth/refresh-token",
    method: "POST",
    requireCsrf: true,
    includeBody: false,
  });
}
