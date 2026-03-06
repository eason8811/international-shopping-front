/**
 * OAuth2 provider 枚举, 与后端契约保持一致
 */
export const OAUTH_PROVIDERS = ["GOOGLE", "TIKTOK", "X"] as const;

/**
 * OAuth2 provider 类型
 */
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

/**
 * 用户账号核心信息
 */
export interface UserAccount {
    /** 用户 ID */
    id: number;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 邮箱 */
    email?: string | null;
    /** 手机区号 */
    phone_country_code?: string | null;
    /** 手机号 */
    phone_national_number: string;
    /** 账号状态 */
    status: "ACTIVE" | "DISABLED" | (string & {});
    /** 最近登录时间 */
    lastLogin_at?: string | null;
    /** 创建时间 */
    created_at: string;
    /** 更新时间 */
    updated_at: string;
}

/**
 * 邮件投递状态信息
 */
export interface EmailStatusData {
    /** 邮箱 */
    email: string;
    /** 邮件服务 messageId */
    message_id: string;
    /** 当前状态 */
    status: string;
}

/**
 * OAuth 授权 URL 响应
 */
export interface OAuthAuthorizeData {
    /** 第三方授权地址 */
    url: string;
}
