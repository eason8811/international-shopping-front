/**
 * 通用 BFF 结果包结构, 用于认证模块请求
 *
 * @template T 数据载荷类型
 * @template M 元数据载荷类型
 */
export interface BffResultEnvelope<T = unknown, M = unknown> {
    success: boolean;
    code: string;
    message: string;
    timestamp: string;
    traceId?: string;
    data?: T;
    meta?: M;
}

/**
 * 请求错误类型, 用于保存 BFF 状态码和链路信息
 */
export class BffRequestError extends Error {
    readonly status: number;
    readonly code?: string;
    readonly traceId?: string;

    /**
     * 创建请求错误实例
     *
     * @param options 错误字段选项
     */
    constructor(options: { status: number; message: string; code?: string; traceId?: string }) {
        super(options.message);
        this.name = "BffRequestError";
        this.status = options.status;
        this.code = options.code;
        this.traceId = options.traceId;
    }
}

/**
 * 地址记录最小结构, 用于识别默认地址状态
 */
export interface AddressRecord {
    is_default?: boolean;
    isDefault?: boolean;
}

/**
 * 重定向载荷结构, 用于认证相关 BFF 响应
 */
export interface RedirectPayload {
    url?: string;
    redirectUrl?: string;
    redirect_url?: string;
}
