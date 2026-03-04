import type {ResultCode} from "./result";

/**
 * 无效 HTTP 状态码场景下的兜底状态
 */
const FALLBACK_STATUS = 500;

/**
 * 常见 HTTP 状态码到业务码的映射表
 */
const STATUS_TO_CODE: Record<number, ResultCode> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY",
    429: "TOO_MANY_REQUESTS",
    500: "INTERNAL_SERVER_ERROR",
    502: "INTERNAL_SERVER_ERROR",
    503: "INTERNAL_SERVER_ERROR",
    504: "INTERNAL_SERVER_ERROR",
};

/**
 * 业务码到 HTTP 状态码的反向映射
 */
const CODE_TO_STATUS: Record<string, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};

/**
 * 构造 `ApiError` 所需参数
 */
export interface ApiErrorOptions {
    /** HTTP 状态码 */
    status?: number;
    /** 业务错误码 */
    code?: ResultCode;
    /** 错误消息 */
    message: string;
    /** 链路追踪 ID */
    traceId?: string;
    /** 附加调试信息 */
    details?: unknown;
}

/**
 * BFF 统一错误模型
 *
 * 该错误会在最终响应阶段转换为统一的错误响应体
 */
export class ApiError extends Error {
    /** 规范化后的 HTTP 状态码 */
    readonly status: number;
    /** 业务错误码 */
    readonly code: ResultCode;
    /** 链路追踪 ID */
    readonly traceId?: string;
    /** 原始上下文信息，便于日志排障 */
    readonly details?: unknown;

    /**
     * @param options 错误构建参数
     */
    constructor(options: ApiErrorOptions) {
        super(options.message);
        this.name = "ApiError";
        this.status = normalizeHttpStatus(options.status);
        this.code = options.code ?? mapStatusToCode(this.status);
        this.traceId = options.traceId;
        this.details = options.details;
    }
}

/**
 * 将 HTTP 状态码映射到业务码
 *
 * @param status HTTP 状态码
 * @returns 对应业务码，未知状态码回退为 `INTERNAL_SERVER_ERROR`
 */
export function mapStatusToCode(status: number): ResultCode {
    return STATUS_TO_CODE[normalizeHttpStatus(status)] ?? "INTERNAL_SERVER_ERROR";
}

/**
 * 将业务码映射到 HTTP 状态码
 *
 * @param code 业务码
 * @returns 对应 HTTP 状态码，未知业务码回退为 500
 */
export function mapCodeToStatus(code: ResultCode): number {
    return CODE_TO_STATUS[code] ?? FALLBACK_STATUS;
}

/**
 * 规范化 HTTP 状态码，非法值统一回退到 500
 *
 * @param status 可能为空或非法的状态码
 * @returns 100-599 范围内的合法状态码
 */
export function normalizeHttpStatus(status: number | undefined): number {
    if (!status || !Number.isInteger(status) || status < 100 || status > 599) {
        return FALLBACK_STATUS;
    }

    return status;
}
