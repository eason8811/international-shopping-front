import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

import {ApiError, mapCodeToStatus, mapStatusToCode} from "./errors";
import {fetchBackend} from "./client";
import {appendSetCookies, readSetCookieHeaders} from "./headers";
import {CSRF_HEADER_NAME, bootstrapCsrfToken, readCsrfToken} from "./csrf";
import {IDEMPOTENCY_HEADER_NAME, resolveIdempotencyKey} from "./idempotency";
import {getTraceId, isResultEnvelope, parseJsonSafely, type ResultCode, type ResultEnvelope} from "./result";

/**
 * 默认开启 CSRF 校验和请求体透传的 HTTP 方法
 */
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * 代理请求配置, 用于 BFF 转发流程
 */
export interface ProxyBffRequestOptions {
    /** 后端 API 路径, 相对于 `/api/v1` */
    backendPath: string;
    /** 指定上游请求方法, 默认沿用入站请求方法 */
    method?: string;
    /** 是否强制要求 CSRF, 默认在写请求中开启 */
    requireCsrf?: boolean;
    /** 是否透传请求体, 默认在写请求中透传 */
    includeBody?: boolean;
    /** 是否注入幂等键 */
    idempotent?: boolean;
}

/**
 * 对外成功响应体, 统一遵循 `Result` 语义
 *
 * @template T 业务数据类型
 */
interface NormalizedSuccessPayload<T = unknown> {
    success: true;
    code: ResultCode;
    message: string;
    timestamp: string;
    traceId?: string;
    data?: T;
    meta?: unknown;
}

/**
 * 对外失败响应体, 统一遵循 `Result` 语义
 */
interface NormalizedErrorPayload {
    success: false;
    code: ResultCode;
    message: string;
    timestamp: string;
    traceId?: string;
}

/**
 * 统一 BFF 代理入口, 负责转发请求到后端并规范化响应
 *
 * @param request Next 请求对象
 * @param options 代理配置
 * @returns 规范化后的 BFF 响应
 */
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

/**
 * 构建上游请求头时使用的控制项
 */
interface BuildHeaderOptions {
    /** 上游请求方法 */
    method: string;
    /** 是否开启 CSRF 注入 */
    requireCsrf: boolean;
    /** 是否注入幂等键 */
    idempotent?: boolean;
    /** 用于累积需要写回浏览器的 `Set-Cookie` */
    collectedSetCookies: string[];
}

/**
 * 构造发往后端的请求头, 处理 cookie, CSRF 和幂等键
 *
 * @param request 入站请求
 * @param options 构建参数
 * @returns 可直接传给 `fetch` 的请求头
 * @throws {ApiError} 当要求 CSRF 且 token 不可用时抛出
 */
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

/**
 * 将入站请求的 query string 透传到上游路径
 *
 * @param path 上游路径
 * @param requestUrl 入站请求完整 URL
 * @returns 拼接 query 后的路径
 */
function withForwardedQuery(path: string, requestUrl: string): string {
    const url = new URL(requestUrl);
    if (!url.search) {
        return path;
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedPath}${url.search}`;
}

/**
 * 读取请求体, 空字符串视为无请求体
 *
 * @param request Next 请求对象
 * @returns 请求体字符串, 或 `undefined`
 */
async function readRequestBody(request: NextRequest): Promise<string | undefined> {
    const rawBody = await request.text();
    if (!rawBody) {
        return undefined;
    }

    return rawBody;
}

/**
 * 处理后端符合 `ResultEnvelope` 的响应
 *
 * @param upstream 上游响应
 * @param payload 已解析响应体
 * @param setCookies 需要回传给浏览器的 `Set-Cookie`
 * @returns 成功响应
 * @throws {ApiError} 当上游业务失败时抛出
 */
function handleResultEnvelope(
    upstream: Response,
    payload: ResultEnvelope,
    setCookies: string[],
): NextResponse {
    const traceId = getTraceId(payload, upstream.headers);

    if (upstream.status < 400 && payload.success) {
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

/**
 * 构造统一成功响应, 并附加透传头
 *
 * @param payload 成功响应体
 * @param setCookies 需要透传的 `Set-Cookie`
 * @returns NextResponse
 */
function createSuccessResponse(payload: NormalizedSuccessPayload, setCookies: string[]): NextResponse {
    const response = NextResponse.json(payload, {status: 200});

    if (payload.traceId) {
        response.headers.set("x-trace-id", payload.traceId);
    }

    appendSetCookies(response.headers, setCookies);
    return response;
}

/**
 * 构造统一错误响应, 并附加透传头
 *
 * @param error 标准化错误对象
 * @param setCookies 需要透传的 `Set-Cookie`
 * @returns NextResponse
 */
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

/**
 * 将任意错误归一化为 `ApiError`
 *
 * @param error 任意抛出值
 * @returns 标准化后的 `ApiError`
 */
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

/**
 * 从上游失败响应中提取可展示消息
 *
 * @param payload 已解析上游响应
 * @param rawText 上游原始文本
 * @param fallback 兜底文案
 * @returns 可读错误消息
 */
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
