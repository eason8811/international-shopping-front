import {buildJsonInit, buildQueryString, requestBff} from "@/lib/api/frontend";

import type {
    Address,
    CreateAddressPayload,
    UpdateAccountPayload,
    UpdateAddressPayload,
    UpdateProfilePayload,
    UserAccount,
    UserProfile,
} from "./types";

/**
 * 获取当前用户账户信息
 *
 * @returns 账户信息
 */
export async function getCurrentAccount(): Promise<UserAccount | undefined> {
    const response = await requestBff<UserAccount>("/api/bff/me");
    return response.data;
}

/**
 * 更新当前用户账户信息
 *
 * @param payload 更新请求体
 * @returns 更新后的账户信息
 */
export async function updateCurrentAccount(payload: UpdateAccountPayload): Promise<UserAccount | undefined> {
    const response = await requestBff<UserAccount>(
        "/api/bff/me",
        buildJsonInit("PATCH", sanitizeEmptyFields(payload)),
    );

    return response.data;
}

/**
 * 获取当前用户资料
 *
 * @returns 用户资料
 */
export async function getCurrentProfile(): Promise<UserProfile | undefined> {
    const response = await requestBff<UserProfile>("/api/bff/me/profile");
    return response.data;
}

/**
 * 更新当前用户资料
 *
 * @param payload 更新请求体
 * @returns 更新后的资料
 */
export async function updateCurrentProfile(payload: UpdateProfilePayload): Promise<UserProfile | undefined> {
    const response = await requestBff<UserProfile>(
        "/api/bff/me/profile",
        buildJsonInit("PATCH", sanitizeEmptyFields(payload)),
    );

    return response.data;
}

/**
 * 获取地址列表
 *
 * @param page 页码
 * @param size 每页数量
 * @returns 地址数组
 */
export async function listAddresses(page = 1, size = 20): Promise<Address[]> {
    const query = buildQueryString({page, size});
    const response = await requestBff<Address[]>(`/api/bff/me/addresses${query}`);
    return response.data ?? [];
}

/**
 * 创建地址
 *
 * @param payload 创建请求体
 * @returns 新增后的地址
 */
export async function createAddress(payload: CreateAddressPayload): Promise<Address | undefined> {
    const response = await requestBff<Address>(
        "/api/bff/me/addresses",
        buildJsonInit("POST", sanitizeEmptyFields(payload)),
    );

    return response.data;
}

/**
 * 更新地址
 *
 * @param id 地址 ID
 * @param payload 更新请求体
 * @returns 更新后的地址
 */
export async function updateAddress(id: number, payload: UpdateAddressPayload): Promise<Address | undefined> {
    const response = await requestBff<Address>(
        `/api/bff/me/addresses/${id}`,
        buildJsonInit("PATCH", sanitizeEmptyFields(payload)),
    );

    return response.data;
}

/**
 * 删除地址
 *
 * @param id 地址 ID
 */
export async function deleteAddress(id: number): Promise<void> {
    await requestBff(
        `/api/bff/me/addresses/${id}`,
        buildJsonInit("DELETE"),
    );
}

/**
 * 设为默认地址
 *
 * @param id 地址 ID
 */
export async function setDefaultAddress(id: number): Promise<void> {
    await requestBff(
        `/api/bff/me/addresses/${id}/set-default`,
        buildJsonInit("POST"),
    );
}

/**
 * 清理对象中的空字符串字段
 *
 * @template T 输入对象类型
 * @param payload 输入对象
 * @returns 清理后的对象
 */
function sanitizeEmptyFields<T extends object>(payload: T): Record<string, unknown> {
    const next: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
        if (value === "") {
            continue;
        }

        next[key] = value;
    }

    return next;
}
