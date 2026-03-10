import type {BffSuccessResponse} from "@/lib/api/bff-client";

import type {
    UserAccountStatus,
    UserAccountView,
    UserAddressSource,
    UserAddressValidationStatus,
    UserAddressView,
    UserCsrfToken,
    UserEmailDeliveryStatus,
    UserEmailStatusView,
    UserGender,
    UserMutationNotice,
    UserPhoneView,
    UserProfileView,
} from "./model";

/**
 * 未知对象记录
 */
type UnknownRecord = Record<string, unknown>;

/**
 * 归一化用户账户响应
 *
 * @param value 原始响应数据
 * @returns 页面可直接使用的账户对象
 */
export function toUserAccountView(value: unknown): UserAccountView {
    const record = asRecord(value, "user account");
    const phoneCountryCode = readOptionalString(record, ["phoneCountryCode", "phone_country_code"]);
    const phoneNationalNumber = readOptionalString(record, ["phoneNationalNumber", "phone_national_number"]);

    return {
        id: readRequiredNumber(record, ["id"], "user account.id"),
        username: readRequiredString(record, ["username"], "user account.username"),
        nickname: readRequiredString(record, ["nickname"], "user account.nickname"),
        email: readOptionalString(record, ["email"]),
        phone: toPhoneView(phoneCountryCode, phoneNationalNumber),
        status: readRequiredEnum<UserAccountStatus>(record, ["status"], "user account.status"),
        lastLoginAt: readOptionalString(record, ["lastLoginAt", "last_login_at", "lastLogin_at"]),
        createdAt: readRequiredString(record, ["createdAt", "created_at"], "user account.createdAt"),
        updatedAt: readRequiredString(record, ["updatedAt", "updated_at"], "user account.updatedAt"),
    };
}

/**
 * 归一化用户资料响应
 *
 * @param value 原始响应数据
 * @returns 页面可直接使用的资料对象
 */
export function toUserProfileView(value: unknown): UserProfileView {
    const record = asRecord(value, "user profile");
    const country = readOptionalString(record, ["country"]);
    const province = readOptionalString(record, ["province"]);
    const city = readOptionalString(record, ["city"]);
    const addressLine = readOptionalString(record, ["addressLine", "address_line"]);
    const zipcode = readOptionalString(record, ["zipcode"]);

    return {
        displayName: readOptionalString(record, ["displayName", "display_name"]),
        avatarUrl: readOptionalString(record, ["avatarUrl", "avatar_url"]),
        gender: readOptionalEnum<UserGender>(record, ["gender"]),
        birthday: readOptionalString(record, ["birthday"]),
        country,
        province,
        city,
        addressLine,
        zipcode,
        extra: readOptionalObject(record, ["extra"]),
        locationLabel: composeLabel([country, province, city]),
        fullAddress: composeLabel([country, province, city, addressLine, zipcode]),
    };
}

/**
 * 归一化用户地址响应
 *
 * @param value 原始响应数据
 * @returns 页面可直接使用的地址对象
 */
export function toUserAddressView(value: unknown): UserAddressView {
    const record = asRecord(value, "user address");
    const phoneCountryCode = readOptionalString(record, ["phoneCountryCode", "phone_country_code"]);
    const phoneNationalNumber = readOptionalString(record, ["phoneNationalNumber", "phone_national_number"]);
    const country = readOptionalString(record, ["country"]);
    const province = readOptionalString(record, ["province"]);
    const city = readOptionalString(record, ["city"]);
    const district = readOptionalString(record, ["district"]);
    const addressLine1 = readRequiredString(record, ["addressLine1", "address_line1"], "user address.addressLine1");
    const addressLine2 = readOptionalString(record, ["addressLine2", "address_line2"]);
    const zipcode = readOptionalString(record, ["zipcode"]);
    const locationLabel = composeLabel([country, province, city, district]);
    const addressLines = [addressLine1, addressLine2].filter(isNonEmptyString);

    return {
        id: readRequiredNumber(record, ["id"], "user address.id"),
        receiverName: readRequiredString(record, ["receiverName", "receiver_name"], "user address.receiverName"),
        phone: toPhoneView(phoneCountryCode, phoneNationalNumber),
        countryCode: readOptionalString(record, ["countryCode", "country_code"]),
        country,
        province,
        city,
        district,
        addressLine1,
        addressLine2,
        zipcode,
        languageCode: readOptionalString(record, ["languageCode", "language_code"]),
        addressSource: readOptionalEnum<UserAddressSource>(record, ["addressSource", "address_source"]),
        validationStatus: readOptionalEnum<UserAddressValidationStatus>(record, ["validationStatus", "validation_status"]),
        isDefault: readBoolean(record, ["isDefault", "is_default"]),
        validatedAt: readOptionalString(record, ["validatedAt", "validated_at"]),
        createdAt: readRequiredString(record, ["createdAt", "created_at"], "user address.createdAt"),
        updatedAt: readRequiredString(record, ["updatedAt", "updated_at"], "user address.updatedAt"),
        locationLabel,
        addressLines,
        fullAddress: composeLabel([country, province, city, district, addressLine1, addressLine2, zipcode]) ?? addressLine1,
    };
}

/**
 * 归一化 CSRF 响应
 *
 * @param value 原始响应数据
 * @returns 可直接使用的 token 对象
 */
export function toUserCsrfToken(value: unknown): UserCsrfToken {
    const record = asRecord(value, "csrf token");

    return {
        token: readRequiredString(record, ["csrfToken", "csrf_token"], "csrf token"),
    };
}

/**
 * 归一化邮件状态响应
 *
 * @param value 原始响应数据
 * @returns 页面可直接使用的邮件状态对象
 */
export function toUserEmailStatusView(value: unknown): UserEmailStatusView {
    const record = asRecord(value, "email status");
    const status = readRequiredEnum<UserEmailDeliveryStatus>(record, ["status"], "email status.status");

    return {
        email: readRequiredString(record, ["email"], "email status.email"),
        messageId: readRequiredString(record, ["messageId", "message_id"], "email status.messageId"),
        status,
        isDelivered: status === "DELIVERED",
    };
}

/**
 * 从 BFF 成功响应中提取统一提示对象
 *
 * @param response 解包后的 BFF 成功响应
 * @returns 统一提示对象
 */
export function toUserMutationNotice(response: BffSuccessResponse): UserMutationNotice {
    return {
        code: response.code,
        message: response.message,
        timestamp: response.timestamp,
        traceId: response.traceId,
    };
}

/**
 * 将国家码与本地号码转为统一手机号对象
 *
 * @param rawCountryCode 原始国家码
 * @param rawNationalNumber 原始本地号码
 * @returns 手机号对象
 */
function toPhoneView(rawCountryCode: string | null, rawNationalNumber: string | null): UserPhoneView {
    const countryCode = normalizePhonePart(rawCountryCode);
    const nationalNumber = normalizePhonePart(rawNationalNumber);
    const e164 = countryCode && nationalNumber ? `+${countryCode}${nationalNumber}` : null;

    return {
        countryCode,
        nationalNumber,
        e164,
        display: e164,
    };
}

/**
 * 读取对象记录
 *
 * @param value 原始值
 * @param label 业务标签
 * @returns 对象记录
 */
function asRecord(value: unknown, label: string): UnknownRecord {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError(`Expected ${label} to be an object`);
    }

    return value as UnknownRecord;
}

/**
 * 读取必填字符串
 *
 * @param record 原始记录
 * @param keys 可选键名
 * @param label 字段标签
 * @returns 字符串值
 */
function readRequiredString(record: UnknownRecord, keys: string[], label: string): string {
    const value = readOptionalString(record, keys);
    if (value === null) {
        throw new TypeError(`Expected ${label} to be a string`);
    }

    return value;
}

/**
 * 读取可选字符串
 *
 * @param record 原始记录
 * @param keys 可选键名
 * @returns 字符串值或 `null`
 */
function readOptionalString(record: UnknownRecord, keys: string[]): string | null {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string") {
            const trimmed = value.trim();
            return trimmed.length > 0 ? trimmed : null;
        }

        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
    }

    return null;
}

/**
 * 读取必填数字
 *
 * @param record 原始记录
 * @param keys 可选键名
 * @param label 字段标签
 * @returns 数字值
 */
function readRequiredNumber(record: UnknownRecord, keys: string[], label: string): number {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === "string" && value.trim()) {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    throw new TypeError(`Expected ${label} to be a number`);
}

/**
 * 读取必填枚举字符串
 *
 * @template T 枚举联合类型
 * @param record 原始记录
 * @param keys 可选键名
 * @param label 字段标签
 * @returns 枚举字符串
 */
function readRequiredEnum<T extends string>(record: UnknownRecord, keys: string[], label: string): T {
    const value = readOptionalEnum<T>(record, keys);
    if (!value) {
        throw new TypeError(`Expected ${label} to be a non-empty enum string`);
    }

    return value;
}

/**
 * 读取可选枚举字符串
 *
 * @template T 枚举联合类型
 * @param record 原始记录
 * @param keys 可选键名
 * @returns 枚举字符串或 `null`
 */
function readOptionalEnum<T extends string>(record: UnknownRecord, keys: string[]): T | null {
    const value = readOptionalString(record, keys);
    return value ? value.toUpperCase() as T : null;
}

/**
 * 读取布尔值
 *
 * @param record 原始记录
 * @param keys 可选键名
 * @returns 布尔值
 */
function readBoolean(record: UnknownRecord, keys: string[]): boolean {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === "boolean") {
            return value;
        }
    }

    return false;
}

/**
 * 读取可选对象
 *
 * @param record 原始记录
 * @param keys 可选键名
 * @returns 对象或 `null`
 */
function readOptionalObject(record: UnknownRecord, keys: string[]): Record<string, unknown> | null {
    for (const key of keys) {
        const value = record[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
            return value as Record<string, unknown>;
        }
    }

    return null;
}

/**
 * 拼接多个地址标签为展示文本
 *
 * @param values 原始文本数组
 * @returns 逗号拼接后的展示文本
 */
function composeLabel(values: Array<string | null | undefined>): string | null {
    const segments = values.filter(isNonEmptyString);
    return segments.length > 0 ? segments.join(", ") : null;
}

/**
 * 规范化电话号码字段
 *
 * @param value 原始值
 * @returns 去掉空白与 `+` 的数字文本
 */
function normalizePhonePart(value: string | null): string | null {
    if (!value) {
        return null;
    }

    const normalized = value.replace(/^\+/, "").trim();
    return normalized.length > 0 ? normalized : null;
}

/**
 * 判断是否为非空字符串
 *
 * @param value 原始值
 * @returns 是否为非空字符串
 */
function isNonEmptyString(value: string | null | undefined): value is string {
    return typeof value === "string" && value.trim().length > 0;
}
