import type { NextRequest } from "next/server";

import { proxyBffRequest } from "@/lib/api/bff";

export async function GET(request: NextRequest) {
  return proxyBffRequest(request, {
    backendPath: "/users/me",
    method: "GET",
    requireCsrf: true,
    includeBody: false,
  });
}
