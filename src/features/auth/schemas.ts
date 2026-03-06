import {z} from "zod";

/**
 * 登录表单校验
 */
export const loginSchema = z.object({
    account: z.string().trim().min(1, "account_required"),
    password: z.string().min(1, "password_required"),
    country_code: z.string().trim().optional(),
});

/**
 * 注册表单校验, 仅保留四个必填字段, 手机号作为可选高级字段
 */
export const registerSchema = z
    .object({
        username: z.string().trim().min(3, "username_min").max(32, "username_max"),
        nickname: z.string().trim().min(1, "nickname_required").max(32, "nickname_max"),
        email: z.string().trim().email("email_invalid"),
        password: z.string().min(8, "password_min"),
        phone_country_code: z.string().trim().optional(),
        phone_national_number: z.string().trim().optional(),
    })
    .superRefine((value, ctx) => {
        const hasCountry = Boolean(value.phone_country_code);
        const hasNumber = Boolean(value.phone_national_number);

        if (hasCountry !== hasNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "phone_pair_required",
                path: [hasCountry ? "phone_national_number" : "phone_country_code"],
            });
        }
    });

/**
 * 发起找回密码表单校验
 */
export const forgotPasswordSchema = z.object({
    account: z.string().trim().min(1, "account_required"),
    country_code: z.string().trim().optional(),
});

/**
 * 重置密码表单校验
 */
export const resetPasswordSchema = z.object({
    account: z.string().trim().min(1, "account_required"),
    code: z.string().trim().min(4, "code_required"),
    new_password: z.string().min(6, "password_min_reset"),
    country_code: z.string().trim().optional(),
});

/**
 * 激活邮箱表单校验
 */
export const verifyEmailSchema = z.object({
    email: z.string().trim().email("email_invalid"),
    code: z.string().trim().min(4, "code_required"),
});

/** 登录请求体 */
export type LoginSchema = z.infer<typeof loginSchema>;
/** 注册请求体 */
export type RegisterSchema = z.infer<typeof registerSchema>;
/** 发起找回密码请求体 */
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
/** 重置密码请求体 */
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
/** 激活邮箱请求体 */
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
