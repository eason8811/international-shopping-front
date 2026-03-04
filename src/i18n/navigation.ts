import {createNavigation} from "next-intl/navigation";

import {routing} from "./routing";

/**
 * 基于 `routing` 生成的国际化导航工具集合
 *
 * 导出包含：
 * - `Link`: 自动携带 locale 的链接组件
 * - `redirect`: 服务端重定向
 * - `usePathname` / `useRouter`: 客户端导航 hooks
 * - `getPathname`: 服务端/工具层路径生成
 */
export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
