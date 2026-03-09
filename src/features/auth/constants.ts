/**
 * 支持的 OAuth 提供方列表, 供登录, 注册, 回调流程共享
 */
export const OAUTH_PROVIDERS = ["GOOGLE", "TIKTOK", "X"] as const;

/**
 * 提供方联合类型, 基于 OAuth 提供方常量推导
 */
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
