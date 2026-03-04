/**
 * 后端 `Result<T>` 协议中约定的业务码
 *
 * 末尾的 `(string & {})` 用于兼容后端新增业务码，避免前端在未升级类型前完全阻塞编译
 */
export type ResultCode =
    | "OK"
    | "CREATED"
    | "ACCEPTED"
    | "FOUND"
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNPROCESSABLE_ENTITY"
    | "TOO_MANY_REQUESTS"
    | "INTERNAL_SERVER_ERROR"
    | (string & {});

/**
 * 后端统一响应包裹结构
 *
 * @template T `data` 的业务载荷类型
 * @template M `meta` 的扩展元信息类型 (如分页元数据)
 */
export interface ResultEnvelope<T = unknown, M = unknown> {
    /** 业务是否成功 */
    success: boolean;
    /** 业务码 */
    code: ResultCode;
    /** 面向用户或日志的业务消息 */
    message: string;
    /** 后端产生该响应的时间戳 (ISO-8601) */
    timestamp: string;
    /** 链路追踪 ID，可用于前后端排障 */
    traceId?: string;
    /** 业务数据主体 */
    data?: T;
    /** 附加元数据 */
    meta?: M;
}

/**
 * 运行时校验一个值是否满足最小 `ResultEnvelope` 结构
 *
 * @param value 待校验的任意值
 * @returns 当存在 `success/code/message/timestamp` 且类型匹配时返回 `true`
 */
export function isResultEnvelope(value: unknown): value is ResultEnvelope {
    if (!value || typeof value !== "object") {
        return false;
    }

    const record = value as Record<string, unknown>;
    return (
        typeof record.success === "boolean" &&
        typeof record.code === "string" &&
        typeof record.message === "string" &&
        typeof record.timestamp === "string"
    );
}

/**
 * 提取 traceId，优先级为：响应体 `traceId` -> `x-trace-id` -> `trace-id`
 *
 * @param payload 已解析的 `ResultEnvelope` (可能为空)
 * @param headers HTTP 响应头
 * @returns 可选的 traceId
 */
export function getTraceId(payload: ResultEnvelope | undefined, headers: Headers): string | undefined {
    return payload?.traceId ?? headers.get("x-trace-id") ?? headers.get("trace-id") ?? undefined;
}

/**
 * 安全解析 JSON 文本
 *
 * @param rawText 原始字符串
 * @returns 解析后的对象；空字符串或非法 JSON 返回 `undefined`
 */
export function parseJsonSafely(rawText: string): unknown | undefined {
    if (!rawText.trim()) {
        return undefined;
    }

    try {
        return JSON.parse(rawText) as unknown;
    } catch {
        return undefined;
    }
}
