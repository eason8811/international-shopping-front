import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

/**
 * 合并 className 字符串, 并处理 tailwind 原子类冲突
 *
 * @param inputs 任意 className 输入
 * @returns 合并后的 className
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
