import {randomUUID} from "node:crypto";

/**
 * 后端约定的幂等键请求头
 */
export const IDEMPOTENCY_HEADER_NAME = "Idempotency-Key";

/**
 * 解析或生成幂等键
 *
 * 优先复用来访请求中的 `Idempotency-Key`, 便于同一业务动作重试保持一致
 * 若不存在则自动生成 UUID
 *
 * @param requestHeaders 来访请求头
 * @returns 幂等键
 */
export function resolveIdempotencyKey(requestHeaders: Headers): string {
    return requestHeaders.get(IDEMPOTENCY_HEADER_NAME) ?? randomUUID();
}
