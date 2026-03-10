import {normalizeOffsetPagination} from "@/lib/schemas/pagination";
import {requestBff} from "@/lib/api/bff-client";
import {
    toUserAddressView,
    toUserMutationNotice,
    type CreateAddressInput,
    type CreateUserAddressResult,
    type ListUserAddressesInput,
    type UpdateAddressInput,
    type UserAddressListView,
    type UserAddressView,
    type UserMutationNotice,
} from "@/entities/user";

/**
 * 地址列表响应中的分页元信息
 */
interface AddressListMeta {
    /** 页码 */
    page?: number;
    /** 每页条数 */
    size?: number;
    /** 总条数 */
    total?: number;
}

/**
 * 获取当前登录用户地址列表
 *
 * @param input 分页输入
 * @returns 地址列表与分页信息
 */
export async function listCurrentUserAddresses(
    input: ListUserAddressesInput = {},
): Promise<UserAddressListView> {
    const page = input.page ?? 1;
    const size = input.size ?? 5;
    const response = await requestBff<unknown[], AddressListMeta>("/users/me/addresses", {
        method: "GET",
        query: {page, size},
    });

    const items = Array.isArray(response.data) ? response.data.map(toUserAddressView) : [];
    return {
        items,
        defaultAddress: items.find((item) => item.isDefault) ?? null,
        pagination: normalizeOffsetPagination({
            page: response.meta?.page ?? page,
            pageSize: response.meta?.size ?? size,
            total: response.meta?.total ?? items.length,
        }),
    };
}

/**
 * 获取当前登录用户单个地址详情
 *
 * @param id 地址 ID
 * @returns 地址视图模型
 */
export async function getCurrentUserAddress(id: number | string): Promise<UserAddressView> {
    const response = await requestBff(`/users/me/addresses/${id}`, {
        method: "GET",
    });

    return toUserAddressView(response.data);
}

/**
 * 创建当前登录用户地址
 *
 * 若后端因幂等命中返回 `ACCEPTED`, 仍会把 `message` 和 `idempotencyKey` 返回给页面, 由页面决定是否继续刷新列表
 *
 * @param input 创建输入
 * @param options 可选创建控制项
 * @returns 创建结果对象
 */
export async function createCurrentUserAddress(
    input: CreateAddressInput,
    options: {idempotencyKey?: string} = {},
): Promise<CreateUserAddressResult> {
    const idempotencyKey = options.idempotencyKey ?? crypto.randomUUID();
    const response = await requestBff("/users/me/addresses", {
        method: "POST",
        headers: {
            "Idempotency-Key": idempotencyKey,
        },
        body: {
            receiverName: input.receiverName,
            phoneCountryCode: input.phoneCountryCode,
            phoneNationalNumber: input.phoneNationalNumber,
            countryCode: input.countryCode,
            country: input.country,
            province: input.province ?? null,
            city: input.city ?? null,
            district: input.district ?? null,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2 ?? null,
            zipcode: input.zipcode ?? null,
            languageCode: input.languageCode ?? null,
            addressSource: input.addressSource ?? "MANUAL",
            rawInput: input.rawInput ?? null,
            googlePlaceId: input.googlePlaceId ?? null,
            placeResponse: input.placeResponse ?? null,
            isDefault: input.isDefault ?? false,
        },
    });

    return {
        ...toUserMutationNotice(response),
        idempotencyKey,
        state: response.code === "CREATED" ? "created" : "accepted",
        address: response.data ? toUserAddressView(response.data) : null,
    };
}

/**
 * 更新当前登录用户地址
 *
 * @param id 地址 ID
 * @param input 更新输入
 * @returns 更新后的地址视图模型
 */
export async function updateCurrentUserAddress(
    id: number | string,
    input: UpdateAddressInput,
): Promise<UserAddressView> {
    const response = await requestBff(`/users/me/addresses/${id}`, {
        method: "PATCH",
        body: {
            receiverName: input.receiverName ?? null,
            phoneCountryCode: input.phoneCountryCode ?? null,
            phoneNationalNumber: input.phoneNationalNumber ?? null,
            countryCode: input.countryCode ?? null,
            country: input.country ?? null,
            province: input.province ?? null,
            city: input.city ?? null,
            district: input.district ?? null,
            addressLine1: input.addressLine1 ?? null,
            addressLine2: input.addressLine2 ?? null,
            zipcode: input.zipcode ?? null,
            languageCode: input.languageCode ?? null,
            addressSource: input.addressSource ?? null,
            rawInput: input.rawInput ?? null,
            googlePlaceId: input.googlePlaceId ?? null,
            placeResponse: input.placeResponse ?? null,
            isDefault: input.isDefault ?? null,
        },
    });

    return toUserAddressView(response.data);
}

/**
 * 删除当前登录用户地址
 *
 * @param id 地址 ID
 * @returns 删除结果提示
 */
export async function deleteCurrentUserAddress(id: number | string): Promise<UserMutationNotice> {
    const response = await requestBff<void>(`/users/me/addresses/${id}`, {
        method: "DELETE",
    });

    return toUserMutationNotice(response);
}

/**
 * 将当前登录用户地址设为默认
 *
 * @param id 地址 ID
 * @returns 默认地址设置结果
 */
export async function setCurrentUserDefaultAddress(id: number | string): Promise<UserMutationNotice> {
    const response = await requestBff<void>(`/users/me/addresses/${id}/set-default`, {
        method: "POST",
    });

    return toUserMutationNotice(response);
}
