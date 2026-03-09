import {OAUTH_PROVIDERS, type OAuthProvider} from "@/features/auth/constants";
import {type AddressRecord, BffRequestError, type BffResultEnvelope} from "@/features/auth/types";

/**
 * 地址列表候选字段名, 用于兼容不同后端响应结构
 */
const ADDRESS_COLLECTION_KEYS = ["records", "items", "content", "list", "rows", "data"];

/**
 * 安全解析 JSON, 解析失败时返回 undefined
 *
 * @param value 原始响应文本
 * @returns 解析后的 JSON 值, 或 undefined
 */
function parseJsonSafely(value: string): unknown {
    if (!value.trim()) {
        return undefined;
    }

    try {
        return JSON.parse(value) as unknown;
    } catch {
        return undefined;
    }
}

/**
 * 检查值是否符合结果包最小结构
 *
 * @param value 未知输入值
 * @returns 当结果包结构有效时返回 true
 */
function isResultEnvelope(value: unknown): value is BffResultEnvelope {
    if (!value || typeof value !== "object") {
        return false;
    }

    const record = value as Record<string, unknown>;
    return (
        typeof record.success === "boolean" &&
        typeof record.code === "string" &&
        typeof record.message === "string" &&
        typeof record.timestamp === "string"
    );
}

/**
 * 从记录对象读取字符串字段
 *
 * @param record 源记录对象
 * @param key 字段键名
 * @returns 字符串值, 或 undefined
 */
function getString(record: Record<string, unknown>, key: string): string | undefined {
    const value = record[key];
    return typeof value === "string" ? value : undefined;
}

/**
 * 规范化 fetch 初始化参数, 强制设置 accept 头, 并为字符串请求体补充默认 content type
 *
 * @param init 可选请求参数
 * @returns 规范化后的请求参数
 */
function normalizeRequestInit(init?: RequestInit): RequestInit {
    const headers = new Headers(init?.headers);
    headers.set("accept", "application/json");

    if (init?.body && typeof init.body === "string" && !headers.has("content-type")) {
        headers.set("content-type", "application/json");
    }

    return {
        cache: "no-store",
        ...init,
        headers,
    };
}

/**
 * 发起 BFF 请求, 统一成功和失败行为
 *
 * @template T 响应数据类型
 * @param url 请求地址
 * @param init 请求参数
 * @returns 规范化后的结果包
 * @throws {BffRequestError} 当请求失败或后端返回业务失败时抛出
 */
export async function requestBff<T = unknown>(url: string, init?: RequestInit): Promise<BffResultEnvelope<T>> {
    let response: Response;

    try {
        response = await fetch(url, normalizeRequestInit(init));
    } catch (error) {
        throw new BffRequestError({
            status: 0,
            message: error instanceof Error ? error.message : "Network request failed",
        });
    }

    const rawText = await response.text();
    const payload = parseJsonSafely(rawText);

    if (isResultEnvelope(payload)) {
        if (payload.success && response.status < 400) {
            return payload as BffResultEnvelope<T>;
        }

        throw new BffRequestError({
            status: response.status,
            code: payload.code,
            traceId: payload.traceId,
            message: payload.message,
        });
    }

    if (response.ok) {
        return {
            success: true,
            code: "OK",
            message: "OK",
            timestamp: new Date().toISOString(),
            data: payload as T,
            traceId: response.headers.get("x-trace-id") ?? undefined,
        };
    }

    let message = response.statusText || "Request failed";
    if (payload && typeof payload === "object") {
        const maybeMessage = getString(payload as Record<string, unknown>, "message");
        if (maybeMessage) {
            message = maybeMessage;
        }
    } else if (rawText.trim()) {
        message = rawText.trim();
    }

    throw new BffRequestError({
        status: response.status,
        message,
        traceId: response.headers.get("x-trace-id") ?? undefined,
    });
}

/**
 * 清洗站内路径, 拒绝外部地址和不安全路径
 *
 * @param input 原始路径值
 * @returns 安全的站内路径, 或 null
 */
export function sanitizeInternalPath(input?: string | null): string | null {
    if (!input) {
        return null;
    }

    const normalized = input.trim();
    if (!normalized.startsWith("/") || normalized.startsWith("//")) {
        return null;
    }

    if (/^\/https?:/i.test(normalized) || normalized.startsWith("/api/")) {
        return null;
    }

    return normalized;
}

/**
 * 将路径转换为带 locale 前缀的路径
 *
 * @param locale locale 片段
 * @param path 应用内路径
 * @returns 带 locale 前缀的路径
 */
export function toLocalizedPath(locale: string, path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const localePrefix = `/${locale}`;

    if (normalizedPath === localePrefix || normalizedPath.startsWith(`${localePrefix}/`)) {
        return normalizedPath;
    }

    if (normalizedPath === "/") {
        return localePrefix;
    }

    return `${localePrefix}${normalizedPath}`;
}

/**
 * 将未知地址载荷转换为地址数组
 *
 * @param data 未知载荷
 * @returns 规范化后的地址数组
 */
function toAddressRecords(data: unknown): AddressRecord[] {
    if (Array.isArray(data)) {
        return data as AddressRecord[];
    }

    if (!data || typeof data !== "object") {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ADDRESS_COLLECTION_KEYS) {
        if (Array.isArray(record[key])) {
            return record[key] as AddressRecord[];
        }
    }

    return [];
}

/**
 * 检查载荷中是否包含默认地址
 *
 * @param data 未知载荷
 * @returns 当至少存在一个默认地址时返回 true
 */
function hasDefaultAddress(data: unknown): boolean {
    return toAddressRecords(data).some((address) => address?.is_default === true || address?.isDefault === true);
}

/**
 * 解析登录后跳转目标, 优先使用 returnTo, 其次处理地址引导, 最后回到账户中心
 *
 * @param locale 当前 locale
 * @param returnTo 可选回跳路径
 * @returns 登录后的目标路径
 */
export async function resolvePostAuthDestination(locale: string, returnTo?: string | null): Promise<string> {
    const safeReturnTo = sanitizeInternalPath(returnTo);
    if (safeReturnTo) {
        return safeReturnTo;
    }

    try {
        const result = await requestBff("/api/bff/account/addresses?page=1&size=20");
        if (!hasDefaultAddress(result.data)) {
            return toLocalizedPath(locale, "/addresses?mode=onboarding");
        }
    } catch {
        return toLocalizedPath(locale, "/account");
    }

    return toLocalizedPath(locale, "/account");
}

/**
 * 规范化查询参数中的提供方值
 *
 * @param input URL 中的提供方字符串
 * @returns 规范化后的提供方, 或 null
 */
export function normalizeProvider(input: string | null): OAuthProvider | null {
    if (!input) {
        return null;
    }

    const provider = input.toUpperCase();
    return OAUTH_PROVIDERS.includes(provider as OAuthProvider) ? (provider as OAuthProvider) : null;
}

/**
 * 从常见载荷字段中提取重定向地址
 *
 * @param data 响应数据
 * @returns 重定向地址字符串, 或 null
 */
export function extractRedirectUrl(data: unknown): string | null {
    if (!data || typeof data !== "object") {
        return null;
    }

    const record = data as Record<string, unknown>;
    const url = getString(record, "url") ?? getString(record, "redirectUrl") ?? getString(record, "redirect_url");

    return url?.trim() ? url : null;
}

/**
 * 规范化重定向目标, 仅允许同源绝对地址或安全站内路径
 *
 * @param raw 原始重定向值
 * @param origin 当前窗口 origin
 * @returns 安全的重定向路径, 或 null
 */
export function normalizeRedirectTarget(raw: string | null, origin: string): string | null {
    if (!raw) {
        return null;
    }

    if (raw.startsWith("/")) {
        return sanitizeInternalPath(raw);
    }

    try {
        const parsed = new URL(raw);
        const currentOrigin = new URL(origin);

        if (parsed.origin !== currentOrigin.origin) {
            return null;
        }

        return sanitizeInternalPath(`${parsed.pathname}${parsed.search}${parsed.hash}`);
    } catch {
        return null;
    }
}

/**
 * 为 OAuth 授权步骤构造回调返回地址
 *
 * @param options 回调地址选项
 * @returns 绝对回调地址
 */
export function createOAuthCallbackReturnUrl(options: {
    origin: string;
    locale: string;
    provider: OAuthProvider;
    intent: "login" | "register" | "bind";
    returnTo?: string | null;
}): string {
    const callbackPath = toLocalizedPath(options.locale, "/oauth2/callback");
    const callbackUrl = new URL(callbackPath, options.origin);

    callbackUrl.searchParams.set("provider", options.provider);
    callbackUrl.searchParams.set("intent", options.intent);

    const safeReturnTo = sanitizeInternalPath(options.returnTo);
    if (safeReturnTo) {
        callbackUrl.searchParams.set("returnTo", safeReturnTo);
    }

    return callbackUrl.toString();
}
