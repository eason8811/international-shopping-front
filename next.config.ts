import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * Next.js 项目配置
 */
const nextConfig: NextConfig = {};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
