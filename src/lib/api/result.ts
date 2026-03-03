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

export interface ResultEnvelope<T = unknown, M = unknown> {
    success: boolean;
    code: ResultCode;
    message: string;
    timestamp: string;
    traceId?: string;
    data?: T;
    meta?: M;
}

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

export function getTraceId(payload: ResultEnvelope | undefined, headers: Headers): string | undefined {
    return payload?.traceId ?? headers.get("x-trace-id") ?? headers.get("trace-id") ?? undefined;
}

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
