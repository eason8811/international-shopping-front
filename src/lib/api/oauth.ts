import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { fetchBackend } from "./client"
import { appendSetCookies, readSetCookieHeaders } from "./headers"
import { isResultEnvelope, parseJsonSafely } from "./result"

const DEFAULT_LOCALE = "en-US"

const OAUTH_PROVIDERS = {
    google: "GOOGLE",
    tiktok: "TIKTOK",
    x: "X",
} as const

export type OAuthProviderSlug = keyof typeof OAUTH_PROVIDERS
export type OAuthProviderCode = (typeof OAUTH_PROVIDERS)[OAuthProviderSlug]

export interface OAuthUpstreamResult {
    response: Response
    payload: unknown
    setCookies: string[]
    redirectTarget: string | null
}

export function resolveOAuthProvider(value: string): OAuthProviderCode | null {
    return OAUTH_PROVIDERS[value.toLowerCase() as OAuthProviderSlug] ?? null
}

export async function requestOAuthUpstream(
    request: NextRequest,
    backendPath: string,
): Promise<OAuthUpstreamResult> {
    const headers = new Headers()
    headers.set("accept", "application/json")

    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
        headers.set("cookie", cookieHeader)
    }

    const response = await fetchBackend(backendPath, {
        method: "GET",
        headers,
    })
    const rawText = await response.text()
    const payload = parseJsonSafely(rawText)
    const setCookies = readSetCookieHeaders(response.headers)

    return {
        response,
        payload,
        setCookies,
        redirectTarget: readOAuthRedirectTarget(response, payload),
    }
}

export function createOAuthRedirect(target: URL, setCookies: string[] = []): NextResponse {
    const response = NextResponse.redirect(target, 302)
    appendSetCookies(response.headers, setCookies)
    return response
}

export function createOAuthLandingUrl(
    request: NextRequest,
    locale: string | null,
    returnTo?: string | null,
): URL {
    const safeLocale = normalizeLocale(locale)
    const url = new URL(`/${safeLocale}/auth`, request.nextUrl.origin)
    url.searchParams.set("oauth", "success")

    if (returnTo) {
        url.searchParams.set("returnTo", returnTo)
    }

    return url
}

export function createOAuthErrorUrl(
    request: NextRequest,
    locale: string | null,
    message: string,
): URL {
    const safeLocale = normalizeLocale(locale)
    const url = new URL(`/${safeLocale}/auth`, request.nextUrl.origin)
    url.searchParams.set("oauth_error", message)
    return url
}

export function readSafeReturnTo(request: NextRequest): string | null {
    const rawValue = request.nextUrl.searchParams.get("returnTo")
        ?? request.nextUrl.searchParams.get("next")

    if (!rawValue) {
        return null
    }

    try {
        const target = new URL(rawValue, request.nextUrl.origin)
        if (target.origin !== request.nextUrl.origin) {
            return null
        }

        if (target.pathname.endsWith("/auth") || target.pathname.startsWith("/api/")) {
            return null
        }

        return `${target.pathname}${target.search}${target.hash}`
    } catch {
        return null
    }
}

export function readLocaleParam(request: NextRequest): string {
    return normalizeLocale(request.nextUrl.searchParams.get("locale"))
}

export function toFrontendRedirectUrl(
    request: NextRequest,
    target: string | null,
    fallback: URL,
): URL {
    if (!target) {
        return fallback
    }

    try {
        const url = new URL(target, request.nextUrl.origin)
        return url.origin === request.nextUrl.origin ? url : fallback
    } catch {
        return fallback
    }
}

export function toRedirectUrl(request: NextRequest, target: string): URL {
    return new URL(target, request.nextUrl.origin)
}

export function isRedirectResponse(response: Response): boolean {
    return response.status >= 300 && response.status < 400
}

function readOAuthRedirectTarget(response: Response, payload: unknown): string | null {
    const location = response.headers.get("location")
    if (location) {
        return location
    }

    if (!isResultEnvelope(payload)) {
        return null
    }

    const data = payload.data
    if (!data || typeof data !== "object") {
        return null
    }

    const url = (data as Record<string, unknown>).url
    return typeof url === "string" && url.trim() ? url : null
}

function normalizeLocale(locale: string | null | undefined): string {
    if (!locale || !/^[a-z]{2}-[A-Z]{2}$/.test(locale)) {
        return DEFAULT_LOCALE
    }

    return locale
}
