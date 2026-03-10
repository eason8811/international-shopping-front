import {cookies, headers} from "next/headers";

import {mapCodeToStatus, mapStatusToCode} from "./errors";
import {getTraceId, isResultEnvelope, parseJsonSafely, type ResultCode} from "./result";

/**
 * 服务端调用 BFF 的成功结果
 *
 * @template T 业务载荷类型
 */
export interface ServerBffResult<T = unknown> {
    /** 业务数据 */
    data?: T;
    /** 附加元数据 */
    meta?: unknown;
    /** 业务码 */
    code: ResultCode;
    /** 提示信息 */
    message: string;
    /** 链路追踪 ID */
    traceId?: string;
}

/**
 * 页面层调用 BFF 时使用的错误模型
 */
export class ServerBffError extends Error {
    /** HTTP 状态码 */
    readonly status: number;
    /** 业务码 */
    readonly code: ResultCode;
    /** 链路追踪 ID */
    readonly traceId?: string;

    /**
     * @param options 错误初始化参数
     */
    constructor(options: { status: number; message: string; code?: ResultCode; traceId?: string }) {
        super(options.message);
        this.name = "ServerBffError";
        this.status = options.status;
        this.code = options.code ?? mapStatusToCode(options.status);
        this.traceId = options.traceId;
    }
}

/**
 * 在 Server Component / Server Action 中请求本站 BFF 路由
 *
 * @template T 业务载荷类型
 * @param path BFF 路径
 * @param init fetch 初始化参数
 * @returns 规范化后的 BFF 结果
 */
export async function requestServerBff<T = unknown>(path: string, init?: RequestInit): Promise<ServerBffResult<T>> {
    const headerStore = await headers();
    const cookieStore = await cookies();
    const requestHeaders = new Headers(init?.headers);

    requestHeaders.set("accept", "application/json");

    if (init?.body && typeof init.body === "string" && !requestHeaders.has("content-type")) {
        requestHeaders.set("content-type", "application/json");
    }

    const cookieHeader = cookieStore
        .getAll()
        .map(({name, value}) => `${name}=${value}`)
        .join("; ");

    if (cookieHeader) {
        requestHeaders.set("cookie", cookieHeader);
    }

    let response: Response;
    try {
        response = await fetch(buildAppUrl(path, headerStore), {
            ...init,
            headers: requestHeaders,
            cache: "no-store",
            redirect: "manual",
        });
    } catch (error) {
        throw new ServerBffError({
            status: 502,
            code: mapStatusToCode(502),
            message: error instanceof Error ? error.message : "Failed to reach BFF route",
        });
    }

    const rawText = await response.text();
    const payload = parseJsonSafely(rawText);

    if (isResultEnvelope(payload)) {
        if (payload.success && response.status < 400) {
            return {
                data: payload.data as T,
                meta: payload.meta,
                code: payload.code,
                message: payload.message,
                traceId: getTraceId(payload, response.headers),
            };
        }

        throw new ServerBffError({
            status: response.status === 200 ? mapCodeToStatus(payload.code) : response.status,
            code: payload.code,
            message: payload.message,
            traceId: getTraceId(payload, response.headers),
        });
    }

    if (response.ok) {
        return {
            data: payload as T,
            code: "OK",
            message: "OK",
            traceId: response.headers.get("x-trace-id") ?? undefined,
        };
    }

    throw new ServerBffError({
        status: response.status,
        code: mapStatusToCode(response.status),
        message: extractMessage(payload, rawText, response.statusText || "Request failed"),
        traceId: response.headers.get("x-trace-id") ?? undefined,
    });
}

/**
 * 构造本站绝对 URL
 *
 * @param path 站内路径
 * @param headerStore 请求头集合
 * @returns 绝对 URL
 */
function buildAppUrl(path: string, headerStore: Awaited<ReturnType<typeof headers>>): URL {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const host = firstForwardedValue(headerStore.get("x-forwarded-host"))
        ?? firstForwardedValue(headerStore.get("host"))
        ?? "127.0.0.1:3000";
    const protocol = firstForwardedValue(headerStore.get("x-forwarded-proto"))
        ?? (host.startsWith("127.0.0.1") || host.startsWith("localhost") ? "http" : "https");

    return new URL(normalizedPath, `${protocol}://${host}`);
}

/**
 * 提取 `Forwarded` 头中的首个值
 *
 * @param value 原始头值
 * @returns 归一化后的首个值
 */
function firstForwardedValue(value: string | null): string | null {
    if (!value) {
        return null;
    }

    const first = value.split(",", 1)[0]?.trim();
    return first || null;
}

/**
 * 从失败响应中提取可读消息
 *
 * @param payload 已解析载荷
 * @param rawText 原始响应文本
 * @param fallback 兜底文案
 * @returns 可读错误消息
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
