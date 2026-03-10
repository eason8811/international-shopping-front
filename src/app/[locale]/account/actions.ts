"use server";

import {cookies} from "next/headers";
import {redirect} from "next/navigation";

import {toLocalizedPath} from "@/features/auth/api/client";
import {requestServerBff} from "@/lib/api/server-bff";

const AUTH_COOKIE_NAMES = ["access_token", "refresh_token", "csrf_token"] as const;

/**
 * 退出当前会话，并清理本地鉴权 Cookie
 *
 * @param locale 当前 locale
 */
export async function logoutAccountAction(locale: string) {
    try {
        await requestServerBff("/api/bff/auth/logout", {
            method: "POST",
        });
    } catch {
        // 无论上游是否已失效，都继续清理前端 Cookie 并回到首页
    }

    const cookieStore = await cookies();
    for (const cookieName of AUTH_COOKIE_NAMES) {
        cookieStore.delete(cookieName);
    }

    redirect(toLocalizedPath(locale, "/"));
}
