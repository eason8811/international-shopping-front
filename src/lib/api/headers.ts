/**
 * `Set-Cookie` 头名
 */
const SET_COOKIE_HEADER = "set-cookie";

/**
 * Node/undici 在不同版本中对 `set-cookie` 读取能力不一致, 这里做类型扩展兼容
 */
type HeadersWithSetCookie = Headers & {
    getSetCookie?: () => string[];
};

/**
 * 从响应头中提取所有 `Set-Cookie` 值
 *
 * @param headers 响应头
 * @returns `Set-Cookie` 字符串数组
 */
export function readSetCookieHeaders(headers: Headers): string[] {
    const withSetCookie = headers as HeadersWithSetCookie;
    if (typeof withSetCookie.getSetCookie === "function") {
        return withSetCookie.getSetCookie().filter((value) => value.length > 0);
    }

    const setCookie = headers.get(SET_COOKIE_HEADER);
    return setCookie ? [setCookie] : [];
}

/**
 * 追加多个 `Set-Cookie` 到目标头对象中
 *
 * @param headers 目标头对象 (通常为 BFF 响应头)
 * @param setCookies 需要透传给浏览器的 `Set-Cookie` 列表
 */
export function appendSetCookies(headers: Headers, setCookies: string[]): void {
    for (const setCookie of setCookies) {
        headers.append(SET_COOKIE_HEADER, setCookie);
    }
}
