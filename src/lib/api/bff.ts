import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

import {ApiError, mapCodeToStatus, mapStatusToCode} from "./errors";
import {fetchBackend} from "./client";
import {appendSetCookies, readSetCookieHeaders} from "./headers";
import {CSRF_HEADER_NAME, bootstrapCsrfToken, readCsrfToken} from "./csrf";
import {IDEMPOTENCY_HEADER_NAME, resolveIdempotencyKey} from "./idempotency";
import {getTraceId, isResultEnvelope, parseJsonSafely, type ResultCode, type ResultEnvelope} from "./result";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export interface ProxyBffRequestOptions {
    backendPath: string;
    method?: string;
    requireCsrf?: boolean;
    includeBody?: boolean;
    idempotent?: boolean;
}

interface NormalizedSuccessPayload<T = unknown> {
    success: true;
    code: ResultCode;
    message: string;
    timestamp: string;
    traceId?: string;
    data?: T;
    meta?: unknown;
}

interface NormalizedErrorPayload {
    success: false;
    code: ResultCode;
    message: string;
    timestamp: string;
    traceId?: string;
}

export async function proxyBffRequest(request: NextRequest, options: ProxyBffRequestOptions): Promise<NextResponse> {
    const method = (options.method ?? request.method).toUpperCase();
    const requireCsrf = options.requireCsrf ?? WRITE_METHODS.has(method);
    const includeBody = options.includeBody ?? WRITE_METHODS.has(method);
    const collectedSetCookies: string[] = [];

    try {
        const requestHeaders = await buildUpstreamHeaders(request, {
            method,
            requireCsrf,
            idempotent: options.idempotent,
            collectedSetCookies,
        });

        const body = includeBody ? await readRequestBody(request) : undefined;
        const upstream = await fetchBackend(withForwardedQuery(options.backendPath, request.url), {
            method,
            headers: requestHeaders,
            body,
        });

        const upstreamRawText = await upstream.text();
        const upstreamPayload = parseJsonSafely(upstreamRawText);
        const upstreamSetCookies = readSetCookieHeaders(upstream.headers);
        collectedSetCookies.push(...upstreamSetCookies);
        const setCookies = [...collectedSetCookies];

        if (isResultEnvelope(upstreamPayload)) {
            return handleResultEnvelope(upstream, upstreamPayload, setCookies);
        }

        if (upstream.ok) {
            return createSuccessResponse(
                {
                    success: true,
                    code: "OK",
                    message: "OK",
                    timestamp: new Date().toISOString(),
                    traceId: upstream.headers.get("x-trace-id") ?? undefined,
                    data: upstreamPayload ?? null,
                },
                setCookies,
            );
        }

        return createErrorResponse(
            normalizeError({
                    status: upstream.status,
                    message: extractMessage(upstreamPayload, upstreamRawText, "Upstream request failed"),
                    details: upstreamPayload ?? upstreamRawText,
                    traceId: upstream.headers.get("x-trace-id") ?? undefined,
                }
            ),
            collectedSetCookies
        );
    } catch (error) {
        return createErrorResponse(normalizeError(error), collectedSetCookies);
    }
}

interface BuildHeaderOptions {
    method: string;
    requireCsrf: boolean;
    idempotent?: boolean;
    collectedSetCookies: string[];
}

async function buildUpstreamHeaders(request: NextRequest, options: BuildHeaderOptions): Promise<Headers> {
    const headers = new Headers();
    headers.set("accept", "application/json");

    let cookieHeader = request.headers.get("cookie") ?? "";
    if (cookieHeader) {
        headers.set("cookie", cookieHeader);
    }

    if (options.requireCsrf) {
        let csrfToken = readCsrfToken(request);

        if (!csrfToken) {
            const bootstrapResult = await bootstrapCsrfToken(request, cookieHeader);
            csrfToken = bootstrapResult.csrfToken;
            cookieHeader = bootstrapResult.cookieHeader;
            options.collectedSetCookies.push(...bootstrapResult.setCookies);

            if (cookieHeader) {
                headers.set("cookie", cookieHeader);
            }
        }

        if (!csrfToken) {
            throw new ApiError({
                status: 401,
                message: "Missing csrf token",
            });
        }

        headers.set(CSRF_HEADER_NAME, csrfToken);
    }

    if (options.idempotent) {
        headers.set(IDEMPOTENCY_HEADER_NAME, resolveIdempotencyKey(request.headers));
    }

    const contentType = request.headers.get("content-type");
    if (contentType && options.method !== "GET" && options.method !== "HEAD") {
        headers.set("content-type", contentType);
    }

    return headers;
}

function withForwardedQuery(path: string, requestUrl: string): string {
    const url = new URL(requestUrl);
    if (!url.search) {
        return path;
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedPath}${url.search}`;
}

async function readRequestBody(request: NextRequest): Promise<string | undefined> {
    const rawBody = await request.text();
    if (!rawBody) {
        return undefined;
    }

    return rawBody;
}

function handleResultEnvelope(
    upstream: Response,
    payload: ResultEnvelope,
    setCookies: string[],
): NextResponse {
    const traceId = getTraceId(payload, upstream.headers);

    if (upstream.status === 200 && payload.success) {
        return createSuccessResponse(
            {
                success: true,
                code: payload.code,
                message: payload.message,
                timestamp: payload.timestamp,
                traceId,
                data: payload.data,
                meta: payload.meta,
            },
            setCookies,
        );
    }

    throw new ApiError({
        status: upstream.status === 200 ? mapCodeToStatus(payload.code) : upstream.status,
        code: payload.code,
        message: payload.message,
        traceId,
        details: payload,
    });
}

function createSuccessResponse(payload: NormalizedSuccessPayload, setCookies: string[]): NextResponse {
    const response = NextResponse.json(payload, {status: 200});

    if (payload.traceId) {
        response.headers.set("x-trace-id", payload.traceId);
    }

    appendSetCookies(response.headers, setCookies);
    return response;
}

function createErrorResponse(error: ApiError, setCookies: string[]): NextResponse {
    const payload: NormalizedErrorPayload = {
        success: false,
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
        traceId: error.traceId,
    };

    const response = NextResponse.json(payload, {status: error.status});

    if (payload.traceId) {
        response.headers.set("x-trace-id", payload.traceId);
    }

    appendSetCookies(response.headers, setCookies);
    return response;
}

function normalizeError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }

    if (error instanceof Error) {
        return new ApiError({
            status: 502,
            code: mapStatusToCode(502),
            message: `BFF upstream error: ${error.message}`,
            details: error,
        });
    }

    return new ApiError({
        status: 500,
        code: mapStatusToCode(500),
        message: "BFF unknown error",
        details: error,
    });
}

function extractMessage(payload: unknown, rawText: string, fallback: string): string {
    if (isResultEnvelope(payload)) {
        return payload.message;
    }

    if (payload && typeof payload === "object") {
        const maybeMessage = (payload as Record<string, unknown>).message;
        if (typeof maybeMessage === "string" && maybeMessage.trim()) {
            return maybeMessage;
        }
    }

    const trimmed = rawText.trim();
    if (trimmed) {
        return trimmed;
    }

    return fallback;
}
