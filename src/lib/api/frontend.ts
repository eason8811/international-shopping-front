import {isResultEnvelope, type ResultEnvelope} from "./result";

/**
 * 浏览器侧 BFF 请求异常, 统一携带状态码, 业务码, traceId
 */
export class FrontendApiError extends Error {
    /** HTTP 状态码 */
    readonly status: number;
    /** 业务错误码 */
    readonly code: string;
    /** 链路追踪 ID */
    readonly traceId?: string;

    /**
     * @param options 异常构造参数
     */
    constructor(options: { status: number; code: string; message: string; traceId?: string }) {
        super(options.message);
        this.name = "FrontendApiError";
        this.status = options.status;
        this.code = options.code;
        this.traceId = options.traceId;
    }
}

/**
 * 浏览器侧查询参数类型, 仅支持基础标量与布尔值
 */
export type QueryValue = string | number | boolean | undefined | null;

/**
 * 构建 URL 查询字符串
 *
 * @param query 查询参数对象
 * @returns 查询字符串, 为空时返回空字符串
 */
export function buildQueryString(query: Record<string, QueryValue>): string {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === "") {
            continue;
        }

        search.set(key, String(value));
    }

    const value = search.toString();
    return value ? `?${value}` : "";
}

/**
 * 浏览器侧统一请求 BFF 接口
 *
 * @template T 业务数据类型
 * @param path BFF 路径, 必须以 `/api/bff` 开头
 * @param init fetch 初始化参数
 * @returns 业务数据
 * @throws FrontendApiError 当响应失败或协议不合法时抛出
 */
export async function requestBff<T>(path: string, init?: RequestInit): Promise<ResultEnvelope<T>> {
    const response = await fetch(path, {
        ...init,
        cache: "no-store",
        credentials: "include",
        headers: {
            accept: "application/json",
            ...(init?.headers ?? {}),
        },
    });

    const payload = (await response.json().catch(() => undefined)) as unknown;
    if (!isResultEnvelope(payload)) {
        throw new FrontendApiError({
            status: response.status || 500,
            code: "INTERNAL_SERVER_ERROR",
            message: "Invalid response envelope",
        });
    }

    if (!response.ok || !payload.success) {
        throw new FrontendApiError({
            status: response.status || 500,
            code: payload.code,
            message: payload.message,
            traceId: payload.traceId,
        });
    }

    return payload as ResultEnvelope<T>;
}

/**
 * 统一构建 JSON 请求配置
 *
 * @param method HTTP 方法
 * @param body 请求体对象
 * @returns RequestInit
 */
export function buildJsonInit(method: "POST" | "PATCH" | "PUT" | "DELETE", body?: unknown): RequestInit {
    return {
        method,
        headers: {
            "content-type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    };
}
