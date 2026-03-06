import {buildJsonInit, buildQueryString, requestBff} from "@/lib/api/frontend";

import type {
    EmailStatusData,
    OAuthAuthorizeData,
    OAuthProvider,
    UserAccount,
} from "./types";
import type {
    ForgotPasswordSchema,
    LoginSchema,
    RegisterSchema,
    ResetPasswordSchema,
    VerifyEmailSchema,
} from "./schemas";

/**
 * 登录
 *
 * @param payload 登录请求体
 * @returns 登录后的账号信息
 */
export async function login(payload: LoginSchema): Promise<UserAccount | undefined> {
    const response = await requestBff<UserAccount>(
        "/api/bff/auth/login",
        buildJsonInit("POST", sanitizePhoneInput(payload)),
    );
    return response.data;
}

/**
 * 注册
 *
 * @param payload 注册请求体
 */
export async function register(payload: RegisterSchema): Promise<void> {
    await requestBff(
        "/api/bff/auth/register",
        buildJsonInit("POST", sanitizePhoneInput(payload)),
    );
}

/**
 * 查询邮箱状态
 *
 * @param email 目标邮箱
 * @returns 邮件状态
 */
export async function getEmailStatus(email: string): Promise<EmailStatusData | undefined> {
    const query = buildQueryString({email});
    const response = await requestBff<EmailStatusData>(`/api/bff/auth/email-status${query}`);
    return response.data;
}

/**
 * 校验邮箱验证码并激活账号
 *
 * @param payload 激活请求体
 * @returns 激活后的账号信息
 */
export async function verifyEmail(payload: VerifyEmailSchema): Promise<UserAccount | undefined> {
    const response = await requestBff<UserAccount>(
        "/api/bff/auth/verify-email",
        buildJsonInit("POST", payload),
    );
    return response.data;
}

/**
 * 重新发送激活邮件
 *
 * @param email 邮箱
 */
export async function resendActivation(email: string): Promise<void> {
    await requestBff(
        "/api/bff/auth/resend-activation",
        buildJsonInit("POST", {email}),
    );
}

/**
 * 发送找回密码验证码
 *
 * @param payload 请求体
 */
export async function forgotPassword(payload: ForgotPasswordSchema): Promise<void> {
    await requestBff(
        "/api/bff/auth/password/forgot",
        buildJsonInit("POST", sanitizePhoneInput(payload)),
    );
}

/**
 * 验证验证码并重置密码
 *
 * @param payload 请求体
 * @returns 重置后账号信息
 */
export async function resetPassword(payload: ResetPasswordSchema): Promise<UserAccount | undefined> {
    const response = await requestBff<UserAccount>(
        "/api/bff/auth/password/reset",
        buildJsonInit("POST", sanitizePhoneInput(payload)),
    );
    return response.data;
}

/**
 * 退出登录
 */
export async function logout(): Promise<void> {
    await requestBff(
        "/api/bff/auth/logout",
        buildJsonInit("POST"),
    );
}

/**
 * 获取 OAuth 授权地址
 *
 * @param provider 第三方 provider
 * @param redirectUrl 登录完成后的前端回跳地址
 * @returns 授权地址
 */
export async function getOauthAuthorizeUrl(provider: OAuthProvider, redirectUrl: string): Promise<string> {
    const query = buildQueryString({redirectUrl});
    const response = await requestBff<OAuthAuthorizeData>(
        `/api/bff/auth/oauth2/${provider}/authorize${query}`,
    );

    return response.data?.url ?? "";
}

/**
 * 统一清理手机号相关可选字段, 为空时不提交给后端
 *
 * @template T 允许包含 `country_code` 或 `phone_*` 字段的输入类型
 * @param payload 输入对象
 * @returns 清理后的新对象
 */
function sanitizePhoneInput<T extends object>(payload: T): Record<string, unknown> {
    const next = {...(payload as Record<string, unknown>)};

    if ("country_code" in next && !next.country_code) {
        delete next.country_code;
    }

    if ("phone_country_code" in next && !next.phone_country_code) {
        delete next.phone_country_code;
    }

    if ("phone_national_number" in next && !next.phone_national_number) {
        delete next.phone_national_number;
    }

    return next;
}
