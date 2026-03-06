/**
 * 规范化站内跳转路径, 防止开放重定向
 *
 * @param value 原始跳转路径
 * @param fallback 兜底路径
 * @returns 安全路径
 */
export function safeRedirectPath(value: string | undefined, fallback: string): string {
    if (!value) {
        return fallback;
    }

    if (!value.startsWith("/") || value.startsWith("//")) {
        return fallback;
    }

    return value;
}
