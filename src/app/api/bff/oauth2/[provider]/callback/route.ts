import type { NextRequest } from "next/server"

import {
    createOAuthErrorUrl,
    createOAuthLandingUrl,
    createOAuthRedirect,
    isRedirectResponse,
    readLocaleParam,
    requestOAuthUpstream,
    resolveOAuthProvider,
    toFrontendRedirectUrl,
} from "@/lib/api/oauth"

interface OAuthCallbackRouteContext {
    params: Promise<{ provider: string }>
}

export async function GET(request: NextRequest, context: OAuthCallbackRouteContext) {
    const { provider } = await context.params
    const backendProvider = resolveOAuthProvider(provider)
    const locale = readLocaleParam(request)

    if (!backendProvider) {
        return createOAuthRedirect(
            createOAuthErrorUrl(request, locale, "Unsupported OAuth provider"),
        )
    }

    const upstream = await requestOAuthUpstream(
        request,
        `/oauth2/${backendProvider}/callback${request.nextUrl.search}`,
    )

    if ((isRedirectResponse(upstream.response) || upstream.response.ok) && upstream.redirectTarget) {
        return createOAuthRedirect(
            toFrontendRedirectUrl(
                request,
                upstream.redirectTarget,
                createOAuthLandingUrl(request, locale),
            ),
            upstream.setCookies,
        )
    }

    return createOAuthRedirect(
        createOAuthErrorUrl(request, locale, "OAuth callback failed"),
        upstream.setCookies,
    )
}
