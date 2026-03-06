import {NextResponse, type NextRequest} from "next/server";

import {proxyBffRequest} from "@/lib/api/bff";

/**
 * OAuth2 provider 枚举, 与后端契约保持一致
 */
const OAUTH_PROVIDERS = ["GOOGLE", "TIKTOK", "X"] as const;

/**
 * 判断 provider 是否为受支持值
 *
 * @param provider provider 字符串
 * @returns 是否受支持
 */
function isSupportedProvider(provider: string): provider is (typeof OAUTH_PROVIDERS)[number] {
    return OAUTH_PROVIDERS.includes(provider as (typeof OAUTH_PROVIDERS)[number]);
}

/**
 * BFF, 获取第三方授权跳转地址
 *
 * 映射, `GET /api/bff/auth/oauth2/{provider}/authorize` -> `GET /api/v1/oauth2/{provider}/authorize`
 *
 * @param request Next 请求对象
 * @param context 路由上下文
 * @returns 统一 Result 响应
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ provider: string }> },
) {
    const {provider} = await context.params;
    const normalizedProvider = provider.toUpperCase();

    if (!isSupportedProvider(normalizedProvider)) {
        return NextResponse.json(
            {
                success: false,
                code: "BAD_REQUEST",
                message: "Unsupported oauth provider",
                timestamp: new Date().toISOString(),
            },
            {status: 400},
        );
    }

    return proxyBffRequest(request, {
        backendPath: `/oauth2/${normalizedProvider}/authorize`,
        method: "GET",
        requireCsrf: false,
        includeBody: false,
    });
}
