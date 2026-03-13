import {BffClientError} from "./bff-client";

/**
 * 统一的前端错误展示模型, 供页面与组件直接渲染
 */
export interface NormalizedClientError {
    /** HTTP 状态码 */
    status: number;
    /** 业务错误码 */
    code: string;
    /** 错误消息 */
    message: string;
    /** 链路追踪 ID */
    traceId?: string;
}

/**
 * 将任意未知错误归一化为可展示结构
 *
 * @param error 原始错误对象
 * @param fallbackMessage 兜底错误文案
 * @returns 适合 UI 展示的错误对象
 */
export function normalizeClientError(
    error: unknown,
    fallbackMessage = "Request failed",
): NormalizedClientError {
    if (error instanceof BffClientError) {
        return {
            status: error.status,
            code: error.code,
            message: error.message,
            traceId: error.traceId,
        };
    }

    if (error instanceof Error) {
        return {
            status: 500,
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || fallbackMessage,
        };
    }

    return {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: fallbackMessage,
    };
}
