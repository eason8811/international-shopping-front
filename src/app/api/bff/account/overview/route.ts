import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

import {fetchBackend} from "@/lib/api/client";
import {bootstrapCsrfToken, CSRF_HEADER_NAME, readCsrfToken} from "@/lib/api/csrf";
import {ApiError, mapCodeToStatus, mapStatusToCode} from "@/lib/api/errors";
import {appendSetCookies, readSetCookieHeaders} from "@/lib/api/headers";
import {getTraceId, isResultEnvelope, parseJsonSafely, type ResultCode} from "@/lib/api/result";

/**
 * 账户总览聚合成功响应结构
 */
interface AccountOverviewPayload {
    /** 账户主体信息 */
    me: unknown;
    /** 资料信息 */
    profile: unknown;
    /** OAuth 绑定列表 */
    bindings: unknown;
    /** 地址列表, 默认读取前 3 条 */
    addresses: unknown;
    /** 地址分页元信息 */
    addressesMeta: unknown;
}

/**
 * 总览子请求的成功载荷
 */
interface UpstreamSliceResult {
    /** 子请求业务数据 */
    data: unknown;
    /** 子请求附加元数据 */
    meta?: unknown;
    /** 子请求 traceId */
    traceId?: string;
}

/**
 * 标准化成功响应结构
 */
interface SuccessEnvelope<T = unknown> {
    /** 成功标记 */
    success: true;
    /** 业务码 */
    code: ResultCode;
    /** 提示信息 */
    message: string;
    /** 服务端时间 */
    timestamp: string;
    /** 追踪标识 */
    traceId?: string;
    /** 业务数据 */
    data: T;
}

/**
 * 标准化失败响应结构
 */
interface ErrorEnvelope {
    /** 成功标记 */
    success: false;
    /** 业务码 */
    code: ResultCode;
    /** 提示信息 */
    message: string;
    /** 服务端时间 */
    timestamp: string;
    /** 追踪标识 */
    traceId?: string;
}

/**
 * BFF: 账户总览聚合
 *
 * 聚合来源:
 * 1. `GET /api/v1/users/me`
 * 2. `GET /api/v1/users/me/profile`
 * 3. `GET /api/v1/users/me/bindings`
 * 4. `GET /api/v1/users/me/addresses?page=1&size=3`
 *
 * @param request Next 请求对象
 * @returns 聚合后的统一 `Result` 响应
 */
export async function GET(request: NextRequest) {
    const collectedSetCookies: string[] = [];

    try {
        const upstreamHeaders = await buildAuthenticatedHeaders(request, collectedSetCookies);

        const [me, profile, bindings, addresses] = await Promise.all([
            requestSlice("/users/me", upstreamHeaders, collectedSetCookies),
            requestSlice("/users/me/profile", upstreamHeaders, collectedSetCookies),
            requestSlice("/users/me/bindings", upstreamHeaders, collectedSetCookies),
            requestSlice("/users/me/addresses?page=1&size=3", upstreamHeaders, collectedSetCookies),
        ]);

        const traceId = me.traceId ?? profile.traceId ?? bindings.traceId ?? addresses.traceId;
        const payload: SuccessEnvelope<AccountOverviewPayload> = {
            success: true,
            code: "OK",
            message: "OK",
            timestamp: new Date().toISOString(),
            traceId,
            data: {
                me: me.data ?? null,
                profile: profile.data ?? null,
                bindings: bindings.data ?? [],
                addresses: addresses.data ?? [],
                addressesMeta: addresses.meta ?? null,
            },
        };

        return createSuccessResponse(payload, collectedSetCookies);
    } catch (error) {
        return createErrorResponse(normalizeError(error), collectedSetCookies);
    }
}

/**
 * 构造账户总览子请求所需请求头
 *
 * @param request 原始请求对象
 * @param collectedSetCookies 用于回传给浏览器的 `Set-Cookie` 累积器
 * @returns 可复用请求头
 */
async function buildAuthenticatedHeaders(request: NextRequest, collectedSetCookies: string[]): Promise<Headers> {
    const headers = new Headers();
    headers.set("accept", "application/json");

    let cookieHeader = request.headers.get("cookie") ?? "";
    if (cookieHeader) {
        headers.set("cookie", cookieHeader);
    }

    let csrfToken = readCsrfToken(request);
    if (!csrfToken) {
        const bootstrapResult = await bootstrapCsrfToken(request, cookieHeader);
        csrfToken = bootstrapResult.csrfToken;
        cookieHeader = bootstrapResult.cookieHeader;
        collectedSetCookies.push(...bootstrapResult.setCookies);

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
    return headers;
}

/**
 * 请求单个聚合切片, 并将上游返回标准化为可组合结果
 *
 * @param backendPath 上游 API 路径
 * @param baseHeaders 复用请求头
 * @param collectedSetCookies 用于回传给浏览器的 `Set-Cookie` 累积器
 * @returns 切片数据结果
 */
async function requestSlice(
    backendPath: string,
    baseHeaders: Headers,
    collectedSetCookies: string[],
): Promise<UpstreamSliceResult> {
    const upstream = await fetchBackend(backendPath, {
        method: "GET",
        headers: new Headers(baseHeaders),
    });

    const rawText = await upstream.text();
    const payload = parseJsonSafely(rawText);
    collectedSetCookies.push(...readSetCookieHeaders(upstream.headers));

    if (isResultEnvelope(payload)) {
        if (upstream.status === 200 && payload.success) {
            return {
                data: payload.data ?? null,
                meta: payload.meta,
                traceId: getTraceId(payload, upstream.headers),
            };
        }

        throw new ApiError({
            status: upstream.status === 200 ? mapCodeToStatus(payload.code) : upstream.status,
            code: payload.code,
            message: payload.message,
            traceId: getTraceId(payload, upstream.headers),
            details: payload,
        });
    }

    if (upstream.ok) {
        return {
            data: payload ?? null,
            traceId: upstream.headers.get("x-trace-id") ?? undefined,
        };
    }

    throw new ApiError({
        status: upstream.status,
        message: extractMessage(payload, rawText, "Upstream request failed"),
        traceId: upstream.headers.get("x-trace-id") ?? undefined,
        details: payload ?? rawText,
    });
}

/**
 * 构造成功响应并透传头信息
 *
 * @param payload 成功响应体
 * @param setCookies 需要透传的 `Set-Cookie`
 * @returns 标准化响应
 */
function createSuccessResponse(payload: SuccessEnvelope, setCookies: string[]): NextResponse {
    const response = NextResponse.json(payload, {status: 200});

    if (payload.traceId) {
        response.headers.set("x-trace-id", payload.traceId);
    }

    appendSetCookies(response.headers, setCookies);
    return response;
}

/**
 * 构造失败响应并透传头信息
 *
 * @param error 标准化错误对象
 * @param setCookies 需要透传的 `Set-Cookie`
 * @returns 标准化响应
 */
function createErrorResponse(error: ApiError, setCookies: string[]): NextResponse {
    const payload: ErrorEnvelope = {
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
 * 标准化任意异常为 `ApiError`
 *
 * @param error 任意抛出值
 * @returns 标准化错误
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
