import {requestBff} from "@/lib/api/bff-client";
import {
    toUserAccountView,
    toUserProfileView,
    type UpdateAccountInput,
    type UpdateProfileInput,
    type UserAccountView,
    type UserProfileView,
} from "@/entities/user";

/**
 * 获取当前登录用户账户信息
 *
 * @returns 账户视图模型
 */
export async function getCurrentUserAccount(): Promise<UserAccountView> {
    const response = await requestBff("/users/me", {
        method: "GET",
    });

    return toUserAccountView(response.data);
}

/**
 * 更新当前登录用户账户信息
 *
 * @param input 更新输入
 * @returns 更新后的账户视图模型
 */
export async function updateCurrentUserAccount(input: UpdateAccountInput): Promise<UserAccountView> {
    const response = await requestBff("/users/me", {
        method: "PATCH",
        body: {
            nickname: input.nickname ?? null,
            phoneCountryCode: input.phoneCountryCode ?? null,
            phoneNationalNumber: input.phoneNationalNumber ?? null,
        },
    });

    return toUserAccountView(response.data);
}

/**
 * 获取当前登录用户资料
 *
 * @returns 资料视图模型
 */
export async function getCurrentUserProfile(): Promise<UserProfileView> {
    const response = await requestBff("/users/me/profile", {
        method: "GET",
    });

    return toUserProfileView(response.data);
}

/**
 * 更新当前登录用户资料
 *
 * @param input 更新输入
 * @returns 更新后的资料视图模型
 */
export async function updateCurrentUserProfile(input: UpdateProfileInput): Promise<UserProfileView> {
    const response = await requestBff("/users/me/profile", {
        method: "PATCH",
        body: {
            displayName: input.displayName ?? null,
            avatarUrl: input.avatarUrl ?? null,
            gender: input.gender ?? null,
            birthday: input.birthday ?? null,
            country: input.country ?? null,
            province: input.province ?? null,
            city: input.city ?? null,
            addressLine: input.addressLine ?? null,
            zipcode: input.zipcode ?? null,
            extra: input.extra ?? null,
        },
    });

    return toUserProfileView(response.data);
}
