import {defineRouting} from "next-intl/routing";

/**
 * next-intl 路由配置
 *
 * 约束：
 * - 所有国际化页面路径统一带 `/{locale}` 前缀
 * - 未命中时回退到 `defaultLocale`
 */
export const routing = defineRouting({
    locales: ["en-US", "es-ES"],
    defaultLocale: "en-US",
});
