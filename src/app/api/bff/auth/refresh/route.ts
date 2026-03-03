import type { NextRequest } from "next/server";

import { proxyBffRequest } from "@/lib/api/bff";

export async function POST(request: NextRequest) {
  return proxyBffRequest(request, {
    backendPath: "/auth/refresh-token",
    method: "POST",
    requireCsrf: true,
    includeBody: false,
  });
}
