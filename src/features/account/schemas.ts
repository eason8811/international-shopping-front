import {z} from "zod";

/**
 * 账户信息表单校验
 */
export const accountFormSchema = z
    .object({
        nickname: z.string().trim().min(1, "nickname_required").max(32, "nickname_max"),
        phone_country_code: z.string().trim().optional(),
        phone_national_number: z.string().trim().optional(),
    })
    .superRefine((value, ctx) => {
        const hasCountry = Boolean(value.phone_country_code);
        const hasNumber = Boolean(value.phone_national_number);

        if (hasCountry === hasNumber) {
            return;
        }

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "phone_pair_required",
            path: [hasCountry ? "phone_national_number" : "phone_country_code"],
        });
    });

/**
 * 资料信息表单校验
 */
export const profileFormSchema = z.object({
    display_name: z.string().trim().max(64, "display_name_max").optional(),
    avatar_url: z.string().trim().url("avatar_url_invalid").or(z.literal("")).optional(),
    gender: z.enum(["UNKNOWN", "MALE", "FEMALE"]).optional(),
    birthday: z.string().trim().optional(),
    country: z.string().trim().max(64, "country_max").optional(),
    province: z.string().trim().max(64, "province_max").optional(),
    city: z.string().trim().max(64, "city_max").optional(),
    address_line: z.string().trim().max(255, "address_max").optional(),
    zipcode: z.string().trim().max(32, "zipcode_max").optional(),
});

/**
 * 地址表单校验
 */
export const addressFormSchema = z.object({
    receiver_name: z.string().trim().min(1, "receiver_required").max(64, "receiver_max"),
    phone_country_code: z.string().trim().min(1, "phone_country_required").max(8, "phone_country_max"),
    phone_national_number: z.string().trim().min(1, "phone_required").max(20, "phone_max"),
    country: z.string().trim().min(1, "country_required").max(64, "country_max"),
    province: z.string().trim().min(1, "province_required").max(64, "province_max"),
    city: z.string().trim().min(1, "city_required").max(64, "city_max"),
    district: z.string().trim().min(1, "district_required").max(64, "district_max"),
    address_line1: z.string().trim().min(1, "address_line1_required").max(255, "address_max"),
    address_line2: z.string().trim().max(255, "address_max").optional(),
    zipcode: z.string().trim().min(1, "zipcode_required").max(32, "zipcode_max"),
    is_default: z.boolean(),
});

/** 账户表单类型 */
export type AccountFormSchema = z.infer<typeof accountFormSchema>;
/** 资料表单类型 */
export type ProfileFormSchema = z.infer<typeof profileFormSchema>;
/** 地址表单类型 */
export type AddressFormSchema = z.infer<typeof addressFormSchema>;
