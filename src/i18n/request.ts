import {hasLocale} from "next-intl";
import {getRequestConfig} from "next-intl/server";

import {routing} from "./routing";

/**
 * next-intl 请求级配置
 *
 * 流程: 
 * 1. 读取请求中的 locale
 * 2. 若不在受支持列表中，则回退到默认 locale
 * 3. 按 locale 动态加载消息文件
 */
export default getRequestConfig(async ({requestLocale}) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    };
});
