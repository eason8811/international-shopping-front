/**
 * 本地开发时后端默认地址
 */
const DEFAULT_BACKEND_ORIGIN = "http://127.0.0.1:8080";
/**
 * 后端 API 前缀默认值
 */
const DEFAULT_BACKEND_API_PREFIX = "/api/v1";

/**
 * 规范化 API 前缀, 确保以 `/` 开头且为空时回退默认值
 *
 * @param prefix 原始前缀
 * @returns 规范化后的前缀
 */
function normalizePrefix(prefix: string): string {
    const trimmed = prefix.trim();
    if (!trimmed) {
        return DEFAULT_BACKEND_API_PREFIX;
    }

    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/**
 * 读取后端服务 origin
 *
 * 优先使用环境变量 `BACKEND_ORIGIN`, 否则回退到本地默认值
 */
export function getBackendOrigin(): string {
    return process.env.BACKEND_ORIGIN?.trim() || DEFAULT_BACKEND_ORIGIN;
}

/**
 * 读取后端 API 前缀
 *
 * 优先使用环境变量 `BACKEND_API_PREFIX`, 并自动执行规范化
 */
export function getBackendApiPrefix(): string {
    return normalizePrefix(process.env.BACKEND_API_PREFIX ?? DEFAULT_BACKEND_API_PREFIX);
}

/**
 * 构造后端完整 URL
 *
 * @param path 业务路径 (支持带或不带前导 `/`)
 * @returns 指向后端 API 的 URL 对象
 */
export function buildBackendUrl(path: string): URL {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const origin = getBackendOrigin();
    const prefix = getBackendApiPrefix();

    return new URL(`${prefix}${normalizedPath}`, origin);
}

/**
 * 发起到后端的统一请求封装
 *
 * 约束：
 * 1. 强制 `cache: "no-store"`, 避免登录态和交易态请求被缓存
 * 2. 强制 `redirect: "manual"`, 由 BFF 显式处理重定向语义
 *
 * @param path 后端 API 路径
 * @param init fetch 初始化参数
 * @returns 后端原始响应对象
 */
export async function fetchBackend(path: string, init: RequestInit): Promise<Response> {
    return fetch(buildBackendUrl(path), {
        ...init,
        cache: "no-store",
        redirect: "manual",
    });
}
