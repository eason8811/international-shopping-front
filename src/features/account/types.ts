/**
 * 用户账户信息
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
 * 用户资料信息
 */
export interface UserProfile {
    /** 展示名称 */
    displayName?: string | null;
    /** 头像 URL */
    avatarUrl?: string | null;
    /** 性别 */
    gender: "UNKNOWN" | "MALE" | "FEMALE" | (string & {});
    /** 生日 */
    birthday?: string | null;
    /** 国家 */
    country?: string | null;
    /** 省份 */
    province?: string | null;
    /** 城市 */
    city?: string | null;
    /** 详细地址 */
    addressLine?: string | null;
    /** 邮编 */
    zipcode?: string | null;
    /** 扩展信息 */
    extra?: Record<string, unknown> | null;
}

/**
 * 地址信息
 */
export interface Address {
    /** 地址 ID */
    id: number;
    /** 收货人 */
    receiver_name: string;
    /** 手机区号 */
    phone_country_code: string;
    /** 手机号 */
    phone_national_number: string;
    /** 国家 */
    country?: string | null;
    /** 省份 */
    province?: string | null;
    /** 城市 */
    city?: string | null;
    /** 区县 */
    district?: string | null;
    /** 地址行 1 */
    address_line1: string;
    /** 地址行 2 */
    address_line2?: string | null;
    /** 邮编 */
    zipcode?: string | null;
    /** 是否默认地址 */
    is_default: boolean;
    /** 创建时间 */
    created_at: string;
    /** 更新时间 */
    updated_at: string;
}

/**
 * 更新账户请求体
 */
export interface UpdateAccountPayload {
    /** 昵称 */
    nickname?: string;
    /** 手机区号 */
    phone_country_code?: string | null;
    /** 手机号 */
    phone_national_number?: string | null;
}

/**
 * 更新资料请求体
 */
export interface UpdateProfilePayload {
    /** 展示名称 */
    display_name?: string | null;
    /** 头像 URL */
    avatar_url?: string | null;
    /** 性别 */
    gender?: string | null;
    /** 生日 */
    birthday?: string | null;
    /** 国家 */
    country?: string | null;
    /** 省份 */
    province?: string | null;
    /** 城市 */
    city?: string | null;
    /** 地址 */
    address_line?: string | null;
    /** 邮编 */
    zipcode?: string | null;
    /** 扩展字段 */
    extra?: Record<string, unknown>;
}

/**
 * 创建地址请求体
 */
export interface CreateAddressPayload {
    /** 收货人 */
    receiver_name: string;
    /** 手机区号 */
    phone_country_code: string;
    /** 手机号 */
    phone_national_number: string;
    /** 国家 */
    country: string;
    /** 省份 */
    province: string;
    /** 城市 */
    city: string;
    /** 区县 */
    district: string;
    /** 地址行 1 */
    address_line1: string;
    /** 地址行 2 */
    address_line2?: string;
    /** 邮编 */
    zipcode: string;
    /** 默认地址标记 */
    is_default?: boolean;
}

/**
 * 更新地址请求体
 */
export interface UpdateAddressPayload {
    /** 收货人 */
    receiver_name?: string;
    /** 手机区号 */
    phone_country_code?: string | null;
    /** 手机号 */
    phone_national_number?: string | null;
    /** 国家 */
    country?: string | null;
    /** 省份 */
    province?: string | null;
    /** 城市 */
    city?: string | null;
    /** 区县 */
    district?: string | null;
    /** 地址行 1 */
    address_line1?: string;
    /** 地址行 2 */
    address_line2?: string | null;
    /** 邮编 */
    zipcode?: string | null;
    /** 默认地址标记 */
    is_default?: boolean;
}
