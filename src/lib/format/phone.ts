/**
 * 归一化手机号国家码输入, 去掉空白与前导加号, 统一为纯号码片段
 *
 * @param value 原始输入
 * @returns 归一化后的国家码
 */
export function normalizePhoneCountryCodeInput(value: string): string {
    return value.trim().replace(/\s+/g, "").replace(/^\+/, "");
}

/**
 * 归一化可选手机号国家码, 空值返回 `null`
 *
 * @param value 原始输入
 * @returns 归一化国家码或 `null`
 */
export function normalizeOptionalPhoneCountryCodeInput(value: string): string | null {
    const normalized = normalizePhoneCountryCodeInput(value);
    return normalized ? normalized : null;
}

/**
 * 将后端国家码值转成输入框更友好的展示文本
 *
 * @param value 后端返回的国家码
 * @returns 带前导加号的输入值
 */
export function formatPhoneCountryCodeForInput(value: string | null | undefined): string {
    const normalized = value ? normalizePhoneCountryCodeInput(value) : "";
    return normalized ? `+${normalized}` : "";
}
