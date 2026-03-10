import {requestBff} from "@/lib/api/bff-client";
import {
    toUserAccountView,
    toUserCsrfToken,
    toUserEmailStatusView,
    toUserMutationNotice,
    type ForgotPasswordInput,
    type LoginInput,
    type RegisterInput,
    type ResendActivationInput,
    type ResetPasswordInput,
    type UserAccountView,
    type UserCsrfToken,
    type UserEmailStatusView,
    type UserMutationNotice,
    type VerifyEmailInput,
} from "@/entities/user";

/**
 * 注册账户, 返回可直接展示的受理结果
 *
 * @param input 注册输入
 * @returns 注册受理结果
 */
export async function registerUser(input: RegisterInput): Promise<UserMutationNotice> {
    const response = await requestBff<void>("/auth/register", {
        method: "POST",
        body: {
            username: input.username,
            password: input.password,
            nickname: input.nickname,
            email: input.email,
            phoneCountryCode: input.phoneCountryCode ?? null,
            phoneNationalNumber: input.phoneNationalNumber ?? null,
        },
    });

    return toUserMutationNotice(response);
}

/**
 * 查询激活邮件投递状态
 *
 * @param email 邮箱
 * @returns 可直接展示的邮件状态对象
 */
export async function getActivationEmailStatus(email: string): Promise<UserEmailStatusView> {
    const response = await requestBff("/auth/email-status", {
        method: "GET",
        query: {email},
    });

    return toUserEmailStatusView(response.data);
}

/**
 * 验证注册邮箱验证码, 成功后返回当前登录用户账户
 *
 * @param input 验证输入
 * @returns 已激活并登录的账户对象
 */
export async function verifyRegistrationEmail(input: VerifyEmailInput): Promise<UserAccountView> {
    const response = await requestBff("/auth/verify-email", {
        method: "POST",
        body: {
            email: input.email,
            code: input.code,
        },
    });

    return toUserAccountView(response.data);
}

/**
 * 重发激活邮件
 *
 * @param input 邮箱输入
 * @returns 受理结果
 */
export async function resendActivationEmail(input: ResendActivationInput): Promise<UserMutationNotice> {
    const response = await requestBff<void>("/auth/resend-activation", {
        method: "POST",
        body: {
            email: input.email,
        },
    });

    return toUserMutationNotice(response);
}

/**
 * 用户登录
 *
 * @param input 登录输入
 * @returns 当前登录用户账户对象
 */
export async function loginUser(input: LoginInput): Promise<UserAccountView> {
    const response = await requestBff("/auth/login", {
        method: "POST",
        body: {
            countryCode: input.countryCode ?? null,
            account: input.account,
            password: input.password,
        },
    });

    return toUserAccountView(response.data);
}

/**
 * 发起找回密码
 *
 * @param input 找回密码输入
 * @returns 受理结果
 */
export async function requestPasswordReset(input: ForgotPasswordInput): Promise<UserMutationNotice> {
    const response = await requestBff<void>("/auth/password/forgot", {
        method: "POST",
        body: {
            countryCode: input.countryCode ?? null,
            account: input.account,
        },
    });

    return toUserMutationNotice(response);
}

/**
 * 验证验证码并重置密码
 *
 * @param input 重置密码输入
 * @returns 已自动登录的账户对象
 */
export async function resetPassword(input: ResetPasswordInput): Promise<UserAccountView> {
    const response = await requestBff("/auth/password/reset", {
        method: "POST",
        body: {
            countryCode: input.countryCode ?? null,
            account: input.account,
            code: input.code,
            newPassword: input.newPassword,
        },
    });

    return toUserAccountView(response.data);
}

/**
 * 退出登录
 *
 * @returns 退出结果
 */
export async function logoutUser(): Promise<UserMutationNotice> {
    const response = await requestBff<void>("/auth/logout", {
        method: "POST",
    });

    return toUserMutationNotice(response);
}

/**
 * 刷新当前会话
 *
 * @returns 刷新结果
 */
export async function refreshUserSession(): Promise<UserMutationNotice> {
    const response = await requestBff<void>("/auth/refresh", {
        method: "POST",
    });

    return toUserMutationNotice(response);
}

/**
 * 获取或轮换当前会话 CSRF token
 *
 * @returns 可直接复用的 CSRF token 对象
 */
export async function issueUserCsrfToken(): Promise<UserCsrfToken> {
    const response = await requestBff("/auth/csrf", {
        method: "GET",
    });

    return toUserCsrfToken(response.data);
}
