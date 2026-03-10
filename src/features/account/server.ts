import {requestServerBff} from "@/lib/api/server-bff";

const ADDRESS_COLLECTION_KEYS = ["records", "items", "content", "list", "rows", "data"];
const TOTAL_KEYS = ["total", "totalCount", "totalElements", "count"];

/**
 * OAuth 绑定摘要
 */
export interface BindingSummary {
    /** 绑定 ID */
    id: string;
    /** 提供方 */
    provider: string;
    /** 发行方 */
    issuer: string | null;
    /** 提供方用户主键 */
    providerUid: string | null;
    /** scope 描述 */
    scope: string | null;
}

/**
 * 地址摘要
 */
export interface AddressSummary {
    /** 地址 ID */
    id: string;
    /** 收件人 */
    receiverName: string | null;
    /** 号码拼接值 */
    phone: string | null;
    /** 国家 */
    country: string | null;
    /** 省州 */
    province: string | null;
    /** 城市 */
    city: string | null;
    /** 区县 */
    district: string | null;
    /** 地址行 1 */
    addressLine1: string | null;
    /** 地址行 2 */
    addressLine2: string | null;
    /** 邮编 */
    zipcode: string | null;
    /** 校验状态 */
    validationStatus: string | null;
    /** 最近校验时间 */
    validatedAt: string | null;
    /** 是否默认地址 */
    isDefault: boolean;
}

/**
 * 地址列表视图模型
 */
export interface AddressCollectionView {
    /** 地址列表 */
    items: AddressSummary[];
    /** 总数 */
    total: number;
    /** 默认地址 */
    defaultAddress: AddressSummary | null;
}

/**
 * 账户总览视图模型
 */
export interface AccountOverviewView {
    /** 邮箱 */
    email: string | null;
    /** 用户名 */
    username: string | null;
    /** 昵称 */
    nickname: string | null;
    /** 语言偏好 */
    language: string | null;
    /** OAuth 绑定列表 */
    bindings: BindingSummary[];
    /** 地址列表 */
    addresses: AddressSummary[];
    /** 地址数量 */
    addressCount: number;
    /** 默认地址 */
    defaultAddress: AddressSummary | null;
}

/**
 * 获取账户总览视图数据
 *
 * @returns 归一化后的总览视图模型
 */
export async function getAccountOverviewView(): Promise<AccountOverviewView> {
    const result = await requestServerBff<unknown>("/api/bff/account/overview");
    const payload = asRecord(result.data);
    const me = asRecord(payload?.me);
    const profile = asRecord(payload?.profile);
    const bindings = normalizeBindings(payload?.bindings);
    const addresses = normalizeAddressCollection(payload?.addresses, payload?.addressesMeta);

    return {
        email: readString(me, ["email"]),
        username: readString(me, ["username"]),
        nickname: readString(profile, ["nickname", "display_name"]),
        language: readString(profile, ["language"]) ?? readNestedString(profile, ["extra", "language"]),
        bindings,
        addresses: addresses.items,
        addressCount: addresses.total,
        defaultAddress: addresses.defaultAddress,
    };
}

/**
 * 获取地址列表视图数据
 *
 * @param page 页码
 * @param size 每页大小
 * @returns 地址列表视图模型
 */
export async function getAddressCollectionView(page: number, size: number): Promise<AddressCollectionView> {
    const result = await requestServerBff<unknown>(`/api/bff/account/addresses?page=${page}&size=${size}`);
    return normalizeAddressCollection(result.data, result.meta);
}

/**
 * 获取单个地址详情视图数据
 *
 * @param id 地址 ID
 * @returns 归一化后的地址数据，若无法识别则返回 `null`
 */
export async function getAddressDetailView(id: string): Promise<AddressSummary | null> {
    const result = await requestServerBff<unknown>(`/api/bff/account/addresses/${encodeURIComponent(id)}`);
    return normalizeAddress(result.data);
}

/**
 * 将地址转换为地区摘要文本
 *
 * @param address 地址摘要
 * @returns 地区文本
 */
export function getAddressRegionText(address: AddressSummary): string {
    return [address.country, address.province, address.city, address.district]
        .filter((value): value is string => Boolean(value))
        .join(" / ");
}

/**
 * 将地址转换为街道摘要文本
 *
 * @param address 地址摘要
 * @returns 地址行文本
 */
export function getAddressStreetText(address: AddressSummary): string {
    return [address.addressLine1, address.addressLine2]
        .filter((value): value is string => Boolean(value))
        .join(", ");
}

/**
 * 归一化地址集合
 *
 * @param data 原始数据载荷
 * @param meta 原始分页元信息
 * @returns 地址集合视图模型
 */
function normalizeAddressCollection(data: unknown, meta: unknown): AddressCollectionView {
    const items = extractAddressArray(data);
    const metaRecord = asRecord(meta);
    const total = readNumber(metaRecord, TOTAL_KEYS) ?? items.length;

    return {
        items,
        total,
        defaultAddress: items.find((item) => item.isDefault) ?? null,
    };
}

/**
 * 提取地址数组
 *
 * @param data 原始地址集合载荷
 * @returns 归一化后的地址数组
 */
function extractAddressArray(data: unknown): AddressSummary[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizeAddress(item))
            .filter((item): item is AddressSummary => item !== null);
    }

    const record = asRecord(data);
    if (!record) {
        return [];
    }

    for (const key of ADDRESS_COLLECTION_KEYS) {
        const candidate = record[key];
        if (!Array.isArray(candidate)) {
            continue;
        }

        return candidate
            .map((item) => normalizeAddress(item))
            .filter((item): item is AddressSummary => item !== null);
    }

    return [];
}

/**
 * 归一化单个地址
 *
 * @param value 原始地址对象
 * @returns 地址摘要，若缺少核心字段则返回 `null`
 */
function normalizeAddress(value: unknown): AddressSummary | null {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const rawId = record.id;
    const id = typeof rawId === "string"
        ? rawId
        : typeof rawId === "number"
            ? String(rawId)
            : null;

    if (!id) {
        return null;
    }

    const phoneCountryCode = readString(record, ["phone_country_code"]);
    const phoneNationalNumber = readString(record, ["phone_national_number"]);
    const phone = phoneCountryCode && phoneNationalNumber
        ? `+${phoneCountryCode} ${phoneNationalNumber}`
        : phoneNationalNumber ?? null;

    return {
        id,
        receiverName: readString(record, ["receiver_name"]),
        phone,
        country: readString(record, ["country", "country_code"]),
        province: readString(record, ["province"]),
        city: readString(record, ["city"]),
        district: readString(record, ["district"]),
        addressLine1: readString(record, ["address_line1"]),
        addressLine2: readString(record, ["address_line2"]),
        zipcode: readString(record, ["zipcode"]),
        validationStatus: readString(record, ["validation_status"]),
        validatedAt: readString(record, ["validated_at"]),
        isDefault: readBoolean(record, ["is_default", "isDefault"]),
    };
}

/**
 * 归一化 OAuth 绑定列表
 *
 * @param value 原始绑定集合载荷
 * @returns 绑定摘要数组
 */
function normalizeBindings(value: unknown): BindingSummary[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            const record = asRecord(item);
            if (!record) {
                return null;
            }

            const provider = readString(record, ["provider"]);
            if (!provider) {
                return null;
            }

            const rawId = record.id;
            const id = typeof rawId === "string"
                ? rawId
                : typeof rawId === "number"
                    ? String(rawId)
                    : provider;

            return {
                id,
                provider,
                issuer: readString(record, ["issuer"]),
                providerUid: readString(record, ["providerUid", "provider_uid"]),
                scope: readString(record, ["scope"]),
            };
        })
        .filter((item): item is BindingSummary => item !== null);
}

/**
 * 将未知值收窄为普通对象
 *
 * @param value 未知输入
 * @returns 普通对象或 `null`
 */
function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

/**
 * 读取字符串字段
 *
 * @param record 源对象
 * @param keys 候选字段名
 * @returns 字符串值或 `null`
 */
function readString(record: Record<string, unknown> | null, keys: string[]): string | null {
    if (!record) {
        return null;
    }

    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) {
            return value;
        }
    }

    return null;
}

/**
 * 读取嵌套字符串字段
 *
 * @param record 源对象
 * @param path 嵌套路径
 * @returns 字符串值或 `null`
 */
function readNestedString(record: Record<string, unknown> | null, path: string[]): string | null {
    let current: unknown = record;

    for (const key of path) {
        const currentRecord = asRecord(current);
        if (!currentRecord) {
            return null;
        }

        current = currentRecord[key];
    }

    return typeof current === "string" && current.trim() ? current : null;
}

/**
 * 读取布尔字段
 *
 * @param record 源对象
 * @param keys 候选字段名
 * @returns 布尔值，缺省为 `false`
 */
function readBoolean(record: Record<string, unknown> | null, keys: string[]): boolean {
    if (!record) {
        return false;
    }

    for (const key of keys) {
        const value = record[key];
        if (typeof value === "boolean") {
            return value;
        }
    }

    return false;
}

/**
 * 读取数字字段
 *
 * @param record 源对象
 * @param keys 候选字段名
 * @returns 数字值或 `null`
 */
function readNumber(record: Record<string, unknown> | null, keys: string[]): number | null {
    if (!record) {
        return null;
    }

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

    return null;
}
