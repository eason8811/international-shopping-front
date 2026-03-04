import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * 注入 next-intl, 指向请求级配置文件
 */
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Next.js 项目配置
 */
const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
};

export default withNextIntl(nextConfig);
