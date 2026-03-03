import type {NextRequest} from "next/server";

import {ApiError} from "./errors";
import {fetchBackend} from "./client";
import {readSetCookieHeaders} from "./headers";
import {getTraceId, isResultEnvelope, parseJsonSafely, type ResultEnvelope} from "./result";

export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "X-CSRF-Token";

export interface BootstrapCsrfResult {
    csrfToken: string;
    cookieHeader: string;
    setCookies: string[];
    traceId?: string;
}

export function readCsrfToken(request: NextRequest): string | undefined {
    return request.cookies.get(CSRF_COOKIE_NAME)?.value ?? request.headers.get(CSRF_HEADER_NAME) ?? undefined;
}

export async function bootstrapCsrfToken(
    request: NextRequest,
    currentCookieHeader: string,
): Promise<BootstrapCsrfResult> {
    const upstream = await fetchBackend("/auth/csrf", {
        method: "GET",
        headers: {
            accept: "application/json",
            cookie: currentCookieHeader,
        },
    });

    const rawText = await upstream.text();
    const payload = parseJsonSafely(rawText);
    const setCookies = readSetCookieHeaders(upstream.headers);

    if (!isResultEnvelope(payload)) {
        throw new ApiError({
            status: upstream.status,
            message: "CSRF bootstrap failed: invalid result envelope",
            details: rawText,
        });
    }

    if (upstream.status !== 200 || !payload.success) {
        throw new ApiError({
            status: upstream.status,
            code: payload.code,
            message: payload.message,
            traceId: getTraceId(payload, upstream.headers),
            details: payload,
        });
    }

    const csrfToken = readCsrfTokenFromPayload(payload) ?? readCsrfTokenFromSetCookie(setCookies);
    if (!csrfToken) {
        throw new ApiError({
            status: 500,
            message: "CSRF bootstrap failed: csrf token is missing in payload and Set-Cookie",
            traceId: getTraceId(payload, upstream.headers),
        });
    }

    return {
        csrfToken,
        cookieHeader: mergeCookieHeader(currentCookieHeader, CSRF_COOKIE_NAME, csrfToken),
        setCookies,
        traceId: getTraceId(payload, upstream.headers),
    };
}

function readCsrfTokenFromPayload(payload: ResultEnvelope): string | undefined {
    const data = payload.data;
    if (!data || typeof data !== "object") {
        return undefined;
    }

    const csrfToken = (data as Record<string, unknown>).csrfToken;
    return typeof csrfToken === "string" && csrfToken.length > 0 ? csrfToken : undefined;
}

function readCsrfTokenFromSetCookie(setCookies: string[]): string | undefined {
    for (const setCookie of setCookies) {
        const prefix = `${CSRF_COOKIE_NAME}=`;
        if (!setCookie.startsWith(prefix)) {
            continue;
        }

        const value = setCookie.slice(prefix.length).split(";", 1)[0];
        if (value) {
            return value;
        }
    }

    return undefined;
}

function mergeCookieHeader(cookieHeader: string, cookieName: string, cookieValue: string): string {
    const pairs = new Map<string, string>();

    for (const part of cookieHeader.split(";")) {
        const trimmed = part.trim();
        if (!trimmed) {
            continue;
        }

        const equalIndex = trimmed.indexOf("=");
        if (equalIndex <= 0) {
            continue;
        }

        const name = trimmed.slice(0, equalIndex);
        const value = trimmed.slice(equalIndex + 1);
        pairs.set(name, value);
    }

    pairs.set(cookieName, cookieValue);

    return Array.from(pairs.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
}
