const SET_COOKIE_HEADER = "set-cookie";

type HeadersWithSetCookie = Headers & {
    getSetCookie?: () => string[];
};

export function readSetCookieHeaders(headers: Headers): string[] {
    const withSetCookie = headers as HeadersWithSetCookie;
    if (typeof withSetCookie.getSetCookie === "function") {
        return withSetCookie.getSetCookie().filter((value) => value.length > 0);
    }

    const setCookie = headers.get(SET_COOKIE_HEADER);
    return setCookie ? [setCookie] : [];
}

export function appendSetCookies(headers: Headers, setCookies: string[]): void {
    for (const setCookie of setCookies) {
        headers.append(SET_COOKIE_HEADER, setCookie);
    }
}
