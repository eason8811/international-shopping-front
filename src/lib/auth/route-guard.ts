import {cookies} from "next/headers";
import {redirect} from "next/navigation";

import {sanitizeInternalPath, toLocalizedPath} from "@/features/auth/api/client";

const AUTH_COOKIE_NAMES = ["access_token", "refresh_token"] as const;

/**
 * 登录守卫参数
 */
interface RequireAuthRouteOptions {
    /** 当前 locale */
    locale: string;
    /** 当前页面路径 */
    pathname: string;
    /** 当前页面查询参数 */
    searchParams?: Record<string, string | string[] | undefined>;
}

/**
 * 检查当前请求是否存在可识别登录态
 *
 * @returns 是否命中登录态 Cookie
 */
export async function hasAuthSession(): Promise<boolean> {
    const cookieStore = await cookies();
    return AUTH_COOKIE_NAMES.some((cookieName) => Boolean(cookieStore.get(cookieName)?.value));
}

/**
 * 若未登录则重定向到登录页，并回带当前站内路径
 *
 * @param options 页面守卫参数
 */
export async function requireAuthRoute(options: RequireAuthRouteOptions): Promise<void> {
    if (await hasAuthSession()) {
        return;
    }

    const loginPath = toLocalizedPath(options.locale, "/login");
    const redirectTarget = buildRedirectTarget(options.pathname, options.searchParams);

    if (!redirectTarget) {
        redirect(loginPath);
    }

    const search = new URLSearchParams();
    search.set("redirect", redirectTarget);
    redirect(`${loginPath}?${search.toString()}`);
}

/**
 * 构造安全的站内回跳路径
 *
 * @param pathname 页面路径
 * @param searchParams 页面查询参数
 * @returns 安全的站内路径，或 `null`
 */
function buildRedirectTarget(
    pathname: string,
    searchParams?: Record<string, string | string[] | undefined>,
): string | null {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const query = new URLSearchParams();

    if (searchParams) {
        for (const [key, rawValue] of Object.entries(searchParams)) {
            if (typeof rawValue === "string") {
                query.set(key, rawValue);
                continue;
            }

            if (Array.isArray(rawValue)) {
                for (const value of rawValue) {
                    query.append(key, value);
                }
            }
        }
    }

    const candidate = query.size > 0 ? `${normalizedPath}?${query.toString()}` : normalizedPath;
    return sanitizeInternalPath(candidate);
}
