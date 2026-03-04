import type { NextRequest } from "next/server";

import { proxyBffRequest } from "@/lib/api/bff";

/**
 * BFF: 获取当前登录用户信息
 *
 * 映射：`GET /api/bff/me` -> `GET /api/v1/users/me`
 *
 * @param request Next 请求对象
 * @returns 统一 `Result` 响应
 */
export async function GET(request: NextRequest) {
  return proxyBffRequest(request, {
    backendPath: "/users/me",
    method: "GET",
    requireCsrf: true,
    includeBody: false,
  });
}
