import createMiddleware from "next-intl/middleware";
import {hasLocale} from "next-intl";
import {type NextRequest, NextResponse} from "next/server";

import {routing} from "@/i18n/routing";

/**
 * next-intl 中间件实例, 负责 locale 协商与路径前缀处理
 */
const handleI18nRouting = createMiddleware(routing);

/**
 * 用于判断登录态的 cookie 名集合, 任一命中即可视为已登录
 */
const AUTH_COOKIE_NAMES = ["access_token", "refresh_token"];

/**
 * 解析请求路径, 返回 locale 与业务路径
 *
 * @param pathname 原始请求路径
 * @returns 解析后的 locale 与 appPath
 */
function resolveLocaleAndPath(pathname: string): { locale: string; appPath: string } {
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0];

    if (firstSegment && hasLocale(routing.locales, firstSegment)) {
        const appPath = segments.length > 1 ? `/${segments.slice(1).join("/")}` : "/";
        return {locale: firstSegment, appPath};
    }

    return {locale: routing.defaultLocale, appPath: pathname || "/"};
}

/**
 * 判断路径是否需要登录守卫
 *
 * @param pathname 业务路径, 不含 locale 前缀
 * @returns 是否命中受保护路径
 */
function isProtectedPath(pathname: string): boolean {
    return (
        pathname === "/me"
        || pathname.startsWith("/me/")
        || pathname === "/account"
        || pathname.startsWith("/account/")
        || pathname === "/addresses"
        || pathname.startsWith("/addresses/")
        || pathname === "/orders"
        || pathname.startsWith("/orders/")
        || pathname === "/payments"
        || pathname.startsWith("/payments/")
        || pathname === "/support"
        || pathname.startsWith("/support/")
        || pathname === "/admin"
        || pathname.startsWith("/admin/")
    );
}

/**
 * 判断请求是否携带登录态 cookie
 *
 * @param request 当前请求对象
 * @returns 是否存在可识别的登录态 cookie
 */
function hasAuthCookie(request: NextRequest): boolean {
    return AUTH_COOKIE_NAMES.some((cookieName) => Boolean(request.cookies.get(cookieName)?.value));
}

/**
 * 全站中间件, 统一串联 locale 协商与前端路由守卫
 *
 * @param request 当前请求对象
 * @returns i18n 结果响应, 或登录跳转响应
 */
export default function proxy(request: NextRequest) {
    const {locale, appPath} = resolveLocaleAndPath(request.nextUrl.pathname);
    const i18nResponse = handleI18nRouting(request);

    if (!isProtectedPath(appPath) || hasAuthCookie(request)) {
        return i18nResponse;
    }

    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
}

/**
 * 中间件匹配规则, 排除 api, _next, 静态资源路径
 */
export const config = {
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
