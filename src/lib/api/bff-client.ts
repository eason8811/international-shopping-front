import {mapStatusToCode} from "./errors";
import {getTraceId, isResultEnvelope, parseJsonSafely, type ResultCode} from "./result";

/**
 * 浏览器访问 BFF 的固定前缀
 */
const BFF_PREFIX = "/api/bff";

/**
 * BFF 请求 query 参数
 */
export interface BffQueryParams {
    [key: string]: string | number | boolean | null | undefined;
}

/**
 * BFF 请求配置
 */
export interface BffRequestOptions {
    /** HTTP 方法, 默认 `GET` */
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    /** query 参数, key 会自动转换为 snake_case */
    query?: BffQueryParams;
    /** 请求体, 传入对象时会自动按 JSON 序列化并将 key 转为 snake_case */
    body?: BodyInit | Record<string, unknown> | Array<unknown> | null;
    /** 额外请求头 */
    headers?: HeadersInit;
    /** 取消信号 */
    signal?: AbortSignal;
}

/**
 * BFF 成功响应结构
 *
 * @template T 业务数据
 * @template M 附加元信息
 */
export interface BffSuccessResponse<T = unknown, M = unknown> {
    /** HTTP 状态码 */
    status: number;
    /** 业务码 */
    code: ResultCode;
    /** 响应消息 */
    message: string;
    /** 服务端时间戳 */
    timestamp: string;
    /** 链路追踪 ID */
    traceId?: string;
    /** 业务数据 */
    data?: T;
    /** 附加元信息 */
    meta?: M;
}

/**
 * BFF 客户端错误构造参数
 */
export interface BffClientErrorOptions {
    /** HTTP 状态码 */
    status: number;
    /** 业务码 */
    code: ResultCode;
    /** 错误消息 */
    message: string;
    /** 链路追踪 ID */
    traceId?: string;
    /** 原始错误上下文 */
    details?: unknown;
}

/**
 * 页面与组件侧统一使用的 BFF 错误模型
 */
export class BffClientError extends Error {
    /** HTTP 状态码 */
    readonly status: number;
    /** 业务码 */
    readonly code: ResultCode;
    /** 链路追踪 ID */
    readonly traceId?: string;
    /** 原始上下文 */
    readonly details?: unknown;

    /**
     * @param options 错误构造参数
     */
    constructor(options: BffClientErrorOptions) {
        super(options.message);
        this.name = "BffClientError";
        this.status = options.status;
        this.code = options.code;
        this.traceId = options.traceId;
        this.details = options.details;
    }
}

/**
 * 请求前端 BFF, 并统一解包 `Result<T>`
 *
 * 该方法同时兼容浏览器组件与服务端页面:
 * 1. 浏览器侧走相对路径
 * 2. 服务端页面自动解析当前请求 origin 与 cookie, 再调用同域 BFF
 *
 * @template T 业务数据
 * @template M 附加元信息
 * @param path BFF 路径, 支持带或不带 `/`
 * @param options 请求配置
 * @returns 解包后的成功响应
 * @throws {BffClientError} 当 HTTP 或业务失败时抛出
 */
export async function requestBff<T = unknown, M = unknown>(
    path: string,
    options: BffRequestOptions = {},
): Promise<BffSuccessResponse<T, M>> {
    const serverContext = await resolveServerRequestContext();
    const url = buildBffUrl(path, options.query, serverContext?.origin);
    const headers = new Headers(options.headers);
    headers.set("accept", "application/json");

    const body = serializeBody(options.body, headers);
    if (serverContext?.cookieHeader && !headers.has("cookie")) {
        headers.set("cookie", serverContext.cookieHeader);
    }

    const response = await fetch(url, {
        method: options.method ?? "GET",
        cache: "no-store",
        credentials: "include",
        headers,
        body,
        signal: options.signal,
    });

    const rawText = await response.text();
    const payload = parseJsonSafely(rawText);
    if (!isResultEnvelope(payload)) {
        throw new BffClientError({
            status: response.status,
            code: mapStatusToCode(response.status),
            message: extractMessage(payload, rawText, "BFF returned an invalid result envelope"),
            details: payload ?? rawText,
        });
    }

    const traceId = getTraceId(payload, response.headers);
    if (!response.ok || !payload.success) {
        throw new BffClientError({
            status: response.status,
            code: payload.code,
            message: payload.message,
            traceId,
            details: payload,
        });
    }

    return {
        status: response.status,
        code: payload.code,
        message: payload.message,
        timestamp: payload.timestamp,
        traceId,
        data: payload.data as T | undefined,
        meta: payload.meta as M | undefined,
    };
}

/**
 * 服务端请求上下文
 */
interface ServerRequestContext {
    /** 当前应用 origin */
    origin: string;
    /** 原始请求 Cookie 头 */
    cookieHeader?: string;
}

/**
 * 解析服务端页面发起 BFF 请求时所需的 origin 与 cookie
 *
 * @returns 服务端上下文, 浏览器环境返回 `undefined`
 */
async function resolveServerRequestContext(): Promise<ServerRequestContext | undefined> {
    if (typeof window !== "undefined") {
        return undefined;
    }

    try {
        const {headers} = await import("next/headers");
        const requestHeaders = await headers();
        const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();
        const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
        const host = forwardedHost || requestHeaders.get("host")?.trim();
        const protocol = forwardedProto || "http";

        if (host) {
            return {
                origin: `${protocol}://${host}`,
                cookieHeader: requestHeaders.get("cookie") ?? undefined,
            };
        }
    } catch {
        // 当前调用不在 Next 请求上下文内时, 走环境变量兜底
    }

    const envOrigin = process.env.APP_ORIGIN?.trim() || process.env.NEXT_PUBLIC_APP_ORIGIN?.trim();
    if (!envOrigin) {
        return undefined;
    }

    return {
        origin: envOrigin.replace(/\/$/, ""),
    };
}

/**
 * 构建完整 BFF URL
 *
 * @param path 业务路径
 * @param query query 参数
 * @param origin 服务端 origin, 浏览器侧不传
 * @returns 可供 `fetch` 使用的 URL
 */
function buildBffUrl(path: string, query: BffQueryParams | undefined, origin?: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${BFF_PREFIX}${normalizedPath}`, origin ?? "http://localhost");

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined || value === null || value === "") {
                continue;
            }

            url.searchParams.set(toSnakeCaseKey(key), String(value));
        }
    }

    return origin ? url.toString() : `${url.pathname}${url.search}`;
}

/**
 * 统一序列化请求体
 *
 * @param body 原始请求体
 * @param headers 请求头
 * @returns 可直接透传给 `fetch` 的 body
 */
function serializeBody(
    body: BffRequestOptions["body"],
    headers: Headers,
): BodyInit | undefined {
    if (body === undefined || body === null) {
        return undefined;
    }

    if (typeof body === "string" || body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
        return body;
    }

    if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
    }

    return JSON.stringify(serializeJsonPayload(body));
}

/**
 * 统一将可序列化请求体转为 snake_case JSON 结构
 *
 * @param value 原始值
 * @returns 转换后的值
 */
function serializeJsonPayload(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(serializeJsonPayload);
    }

    if (!isPlainObject(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [
            toSnakeCaseKey(key),
            serializeJsonPayload(nestedValue),
        ]),
    );
}

/**
 * 判断值是否为普通对象
 *
 * @param value 原始值
 * @returns 是否为普通对象
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (!value || typeof value !== "object") {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

/**
 * 将 key 统一转换为 snake_case
 *
 * @param value 原始 key
 * @returns snake_case key
 */
function toSnakeCaseKey(value: string): string {
    return value
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
        .replace(/[-\s]+/g, "_")
        .toLowerCase();
}

/**
 * 提取可展示错误消息
 *
 * @param payload 已解析响应体
 * @param rawText 原始文本
 * @param fallback 兜底文案
 * @returns 错误消息
 */
function extractMessage(payload: unknown, rawText: string, fallback: string): string {
    if (payload && typeof payload === "object") {
        const maybeMessage = (payload as Record<string, unknown>).message;
        if (typeof maybeMessage === "string" && maybeMessage.trim()) {
            return maybeMessage;
        }
    }

    const trimmed = rawText.trim();
    return trimmed || fallback;
}
