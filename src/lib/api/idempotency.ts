import {randomUUID} from "node:crypto";

export const IDEMPOTENCY_HEADER_NAME = "Idempotency-Key";

export function resolveIdempotencyKey(requestHeaders: Headers): string {
    return requestHeaders.get(IDEMPOTENCY_HEADER_NAME) ?? randomUUID();
}
