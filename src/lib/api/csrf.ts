import type {NextRequest} from "next/server";

import {ApiError} from "./errors";
import {fetchBackend} from "./client";
import {readSetCookieHeaders} from "./headers";
import {getTraceId, isResultEnvelope, parseJsonSafely, type ResultEnvelope} from "./result";

/**
 * CSRF token cookie 名称 (双提交方案)
 */
export const CSRF_COOKIE_NAME = "csrf_token";
/**
 * CSRF token 请求头名称 (双提交方案)
 */
export const CSRF_HEADER_NAME = "X-CSRF-Token";

/**
 * CSRF 引导 (bootstrap)结果
 */
export interface BootstrapCsrfResult {
    /** 可用于本次写请求的 token */
    csrfToken: string;
    /** 合并后可直接透传给上游的 Cookie 头 */
    cookieHeader: string;
    /** 需要回写给浏览器的 Set-Cookie */
    setCookies: string[];
    /** 可选 traceId */
    traceId?: string;
}

/**
 * 从请求中读取 CSRF token
 *
 * 优先读 cookie (`csrf_token`), 其次读请求头 (`X-CSRF-Token`)
 *
 * @param request Next 请求对象
 * @returns token 或 `undefined`
 */
export function readCsrfToken(request: NextRequest): string | undefined {
    return request.cookies.get(CSRF_COOKIE_NAME)?.value ?? request.headers.get(CSRF_HEADER_NAME) ?? undefined;
}

/**
 * 在 token 缺失时向后端请求新的 CSRF token
 *
 * @param request 原始请求, 用于透传上下文
 * @param currentCookieHeader 当前 Cookie 头字符串
 * @returns 包含 token、更新后 cookie 头与 `Set-Cookie` 的结构
 * @throws {ApiError} 当后端响应不合法、业务失败或无法提取 token 时抛出
 */
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

/**
 * 尝试从 `ResultEnvelope.data` 中读取 `csrfToken` 字段
 *
 * @param payload CSRF 接口响应体
 * @returns token 或 `undefined`
 */
function readCsrfTokenFromPayload(payload: ResultEnvelope): string | undefined {
    const data = payload.data;
    if (!data || typeof data !== "object") {
        return undefined;
    }

    const csrfToken = (data as Record<string, unknown>).csrfToken;
    return typeof csrfToken === "string" && csrfToken.length > 0 ? csrfToken : undefined;
}

/**
 * 尝试从 `Set-Cookie` 列表中提取 `csrf_token`
 *
 * @param setCookies `Set-Cookie` 头值数组
 * @returns token 或 `undefined`
 */
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

/**
 * 合并 Cookie 头并覆盖指定 cookie 的值
 *
 * @param cookieHeader 原始 Cookie 头
 * @param cookieName 目标 cookie 名
 * @param cookieValue 目标 cookie 值
 * @returns 合并后的 Cookie 头字符串
 */
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
