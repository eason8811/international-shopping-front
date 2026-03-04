import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

/**
 * 全站中间件
 * - 处理 locale 协商与路径前缀
 * - 保证 App Router 的国际化路由一致性
 */
export default createMiddleware(routing);

/**
 * 中间件匹配规则
 * - 排除 `api`、`trpc`、`_next`、`_vercel`
 * - 排除包含文件扩展名的静态资源路径
 */
export const config = {
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
