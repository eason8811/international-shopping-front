import type {ResultCode} from "@/lib/api/result";
import type {OffsetPaginationMeta} from "@/lib/schemas/pagination";

/**
 * 用户账户状态
 */
export type UserAccountStatus = "ACTIVE" | "DISABLED";

/**
 * 用户性别
 */
export type UserGender = "UNKNOWN" | "MALE" | "FEMALE";

/**
 * 收货地址来源
 */
export type UserAddressSource = "MANUAL" | "GOOGLE_AUTOCOMPLETE" | "GOOGLE_MAP_PICK";

/**
 * 收货地址校验状态
 */
export type UserAddressValidationStatus = "UNVALIDATED" | "ACCEPT" | "REVIEW" | "FIX" | "REJECT";

/**
 * 激活邮件投递状态
 */
export type UserEmailDeliveryStatus =
    | "BOUNCED"
    | "CANCELED"
    | "CLICKED"
    | "COMPLAINED"
    | "DELIVERED"
    | "DELIVERY_DELAYED"
    | "FAILED"
    | "OPENED"
    | "QUEUED"
    | "SCHEDULED"
    | "SENT"
    | "UNKNOWN";

/**
 * 统一手机号视图模型
 */
export interface UserPhoneView {
    /** 国家码 */
    countryCode: string | null;
    /** 本地号码 */
    nationalNumber: string | null;
    /** E.164 样式完整号码 */
    e164: string | null;
    /** 直接展示的格式化文本 */
    display: string | null;
}

/**
 * 当前用户账户视图模型
 */
export interface UserAccountView {
    /** 用户 ID */
    id: number;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 邮箱 */
    email: string | null;
    /** 联系电话 */
    phone: UserPhoneView;
    /** 账户状态 */
    status: UserAccountStatus;
    /** 最近登录时间 */
    lastLoginAt: string | null;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
}

/**
 * 当前用户资料视图模型
 */
export interface UserProfileView {
    /** 展示名 */
    displayName: string | null;
    /** 头像 URL */
    avatarUrl: string | null;
    /** 性别 */
    gender: UserGender | null;
    /** 生日 */
    birthday: string | null;
    /** 国家 */
    country: string | null;
    /** 省份 */
    province: string | null;
    /** 城市 */
    city: string | null;
    /** 详细地址 */
    addressLine: string | null;
    /** 邮编 */
    zipcode: string | null;
    /** 扩展信息 */
    extra: Record<string, unknown> | null;
    /** 拼装后的地区展示文本 */
    locationLabel: string | null;
    /** 拼装后的完整地址文本 */
    fullAddress: string | null;
}

/**
 * 当前用户收货地址视图模型
 */
export interface UserAddressView {
    /** 地址 ID */
    id: number;
    /** 收件人 */
    receiverName: string;
    /** 联系电话 */
    phone: UserPhoneView;
    /** 国家编码 */
    countryCode: string | null;
    /** 国家 */
    country: string | null;
    /** 省份 */
    province: string | null;
    /** 城市 */
    city: string | null;
    /** 区县 */
    district: string | null;
    /** 地址第一行 */
    addressLine1: string;
    /** 地址第二行 */
    addressLine2: string | null;
    /** 邮编 */
    zipcode: string | null;
    /** 语言编码 */
    languageCode: string | null;
    /** 地址来源 */
    addressSource: UserAddressSource | null;
    /** 地址校验状态 */
    validationStatus: UserAddressValidationStatus | null;
    /** 是否默认地址 */
    isDefault: boolean;
    /** 地址校验时间 */
    validatedAt: string | null;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 地区展示文本 */
    locationLabel: string | null;
    /** 地址展示分行 */
    addressLines: string[];
    /** 完整地址文本 */
    fullAddress: string;
}

/**
 * 当前用户地址列表视图模型
 */
export interface UserAddressListView {
    /** 地址列表 */
    items: UserAddressView[];
    /** 默认地址 */
    defaultAddress: UserAddressView | null;
    /** 分页信息 */
    pagination: OffsetPaginationMeta;
}

/**
 * 不返回业务实体时的统一提示对象
 */
export interface UserMutationNotice {
    /** 业务码 */
    code: ResultCode;
    /** 响应消息 */
    message: string;
    /** 时间戳 */
    timestamp: string;
    /** 链路追踪 ID */
    traceId?: string;
}

/**
 * CSRF 令牌对象
 */
export interface UserCsrfToken {
    /** 当前会话绑定的 CSRF token */
    token: string;
}

/**
 * 邮件投递状态对象
 */
export interface UserEmailStatusView {
    /** 查询邮箱 */
    email: string;
    /** 邮件投递平台消息 ID */
    messageId: string;
    /** 当前投递状态 */
    status: UserEmailDeliveryStatus;
    /** 是否已进入可视为成功送达的状态 */
    isDelivered: boolean;
}

/**
 * 创建地址动作的结果对象
 */
export interface CreateUserAddressResult extends UserMutationNotice {
    /** 幂等键, 便于页面在重试时复用 */
    idempotencyKey: string;
    /** 本次请求的处理结果 */
    state: "created" | "accepted";
    /** 若后端直接返回新地址, 则携带地址详情 */
    address: UserAddressView | null;
}

/**
 * 注册输入
 */
export interface RegisterInput {
    /** 用户名 */
    username: string;
    /** 密码 */
    password: string;
    /** 昵称 */
    nickname: string;
    /** 邮箱 */
    email: string;
    /** 手机国家码 */
    phoneCountryCode?: string | null;
    /** 手机本地号码 */
    phoneNationalNumber?: string | null;
}

/**
 * 登录输入
 */
export interface LoginInput {
    /** 手机国家码, account 为手机号时传 */
    countryCode?: string | null;
    /** 用户名, 邮箱或手机号 */
    account: string;
    /** 密码 */
    password: string;
}

/**
 * 激活邮箱验证码输入
 */
export interface VerifyEmailInput {
    /** 邮箱 */
    email: string;
    /** 验证码 */
    code: string;
}

/**
 * 重发激活邮件输入
 */
export interface ResendActivationInput {
    /** 邮箱 */
    email: string;
}

/**
 * 发起找回密码输入
 */
export interface ForgotPasswordInput {
    /** 手机国家码, account 为手机号时传 */
    countryCode?: string | null;
    /** 用户名, 邮箱或手机号 */
    account: string;
}

/**
 * 重置密码输入
 */
export interface ResetPasswordInput {
    /** 手机国家码, account 为手机号时传 */
    countryCode?: string | null;
    /** 用户名, 邮箱或手机号 */
    account: string;
    /** 验证码 */
    code: string;
    /** 新密码 */
    newPassword: string;
}

/**
 * 更新账户输入
 */
export interface UpdateAccountInput {
    /** 新昵称 */
    nickname?: string | null;
    /** 手机国家码 */
    phoneCountryCode?: string | null;
    /** 手机本地号码 */
    phoneNationalNumber?: string | null;
}

/**
 * 更新资料输入
 */
export interface UpdateProfileInput {
    /** 展示名 */
    displayName?: string | null;
    /** 头像 URL */
    avatarUrl?: string | null;
    /** 性别 */
    gender?: UserGender | null;
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
 * 地址列表查询输入
 */
export interface ListUserAddressesInput {
    /** 页码 */
    page?: number;
    /** 每页条数 */
    size?: number;
}

/**
 * 创建地址输入
 */
export interface CreateAddressInput {
    /** 收件人 */
    receiverName: string;
    /** 电话国家码 */
    phoneCountryCode: string;
    /** 电话本地号码 */
    phoneNationalNumber: string;
    /** 国家编码 */
    countryCode: string;
    /** 国家 */
    country: string;
    /** 省份 */
    province?: string | null;
    /** 城市 */
    city?: string | null;
    /** 区县 */
    district?: string | null;
    /** 地址第一行 */
    addressLine1: string;
    /** 地址第二行 */
    addressLine2?: string | null;
    /** 邮编 */
    zipcode?: string | null;
    /** 语言编码 */
    languageCode?: string | null;
    /** 地址来源, 默认 `MANUAL` */
    addressSource?: UserAddressSource | null;
    /** 原始输入 */
    rawInput?: string | null;
    /** Google Place ID */
    googlePlaceId?: string | null;
    /** Google place 响应 */
    placeResponse?: Record<string, unknown> | null;
    /** 是否默认地址 */
    isDefault?: boolean;
}

/**
 * 更新地址输入
 */
export interface UpdateAddressInput {
    /** 收件人 */
    receiverName?: string | null;
    /** 电话国家码 */
    phoneCountryCode?: string | null;
    /** 电话本地号码 */
    phoneNationalNumber?: string | null;
    /** 国家编码 */
    countryCode?: string | null;
    /** 国家 */
    country?: string | null;
    /** 省份 */
    province?: string | null;
    /** 城市 */
    city?: string | null;
    /** 区县 */
    district?: string | null;
    /** 地址第一行 */
    addressLine1?: string | null;
    /** 地址第二行 */
    addressLine2?: string | null;
    /** 邮编 */
    zipcode?: string | null;
    /** 语言编码 */
    languageCode?: string | null;
    /** 地址来源 */
    addressSource?: UserAddressSource | null;
    /** 原始输入 */
    rawInput?: string | null;
    /** Google Place ID */
    googlePlaceId?: string | null;
    /** Google place 响应 */
    placeResponse?: Record<string, unknown> | null;
    /** 是否默认地址 */
    isDefault?: boolean | null;
}
