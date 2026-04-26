import type { NextRequest } from "next/server"

import {
    createOAuthErrorUrl,
    createOAuthLandingUrl,
    createOAuthRedirect,
    isRedirectResponse,
    readLocaleParam,
    readSafeReturnTo,
    requestOAuthUpstream,
    resolveOAuthProvider,
    toRedirectUrl,
} from "@/lib/api/oauth"

interface OAuthAuthorizeRouteContext {
    params: Promise<{ provider: string }>
}

export async function GET(request: NextRequest, context: OAuthAuthorizeRouteContext) {
    const { provider } = await context.params
    const backendProvider = resolveOAuthProvider(provider)
    const locale = readLocaleParam(request)

    if (!backendProvider) {
        return createOAuthRedirect(
            createOAuthErrorUrl(request, locale, "Unsupported OAuth provider"),
        )
    }

    const redirectUrl = createOAuthLandingUrl(request, locale, readSafeReturnTo(request))
    const upstream = await requestOAuthUpstream(
        request,
        `/oauth2/${backendProvider}/authorize?redirectUrl=${encodeURIComponent(redirectUrl.toString())}`,
    )

    if ((isRedirectResponse(upstream.response) || upstream.response.ok) && upstream.redirectTarget) {
        return createOAuthRedirect(
            toRedirectUrl(request, upstream.redirectTarget),
            upstream.setCookies,
        )
    }

    return createOAuthRedirect(
        createOAuthErrorUrl(request, locale, "OAuth authorization failed"),
        upstream.setCookies,
    )
}
