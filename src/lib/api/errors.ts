import type {ResultCode} from "./result";

const FALLBACK_STATUS = 500;

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

export interface ApiErrorOptions {
    status?: number;
    code?: ResultCode;
    message: string;
    traceId?: string;
    details?: unknown;
}

export class ApiError extends Error {
    readonly status: number;
    readonly code: ResultCode;
    readonly traceId?: string;
    readonly details?: unknown;

    constructor(options: ApiErrorOptions) {
        super(options.message);
        this.name = "ApiError";
        this.status = normalizeHttpStatus(options.status);
        this.code = options.code ?? mapStatusToCode(this.status);
        this.traceId = options.traceId;
        this.details = options.details;
    }
}

export function mapStatusToCode(status: number): ResultCode {
    return STATUS_TO_CODE[normalizeHttpStatus(status)] ?? "INTERNAL_SERVER_ERROR";
}

export function mapCodeToStatus(code: ResultCode): number {
    return CODE_TO_STATUS[code] ?? FALLBACK_STATUS;
}

export function normalizeHttpStatus(status: number | undefined): number {
    if (!status || !Number.isInteger(status) || status < 100 || status > 599) {
        return FALLBACK_STATUS;
    }

    return status;
}
