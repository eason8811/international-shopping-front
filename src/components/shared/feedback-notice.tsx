"use client";

import {AlertCircle, CheckCircle2, Info} from "lucide-react";

import {cn} from "@/lib/utils";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

/**
 * 表单与页面局部反馈的语义类型
 */
export type FeedbackNoticeTone = "info" | "success" | "error";

/**
 * 通用反馈提示组件入参
 */
interface FeedbackNoticeProps {
    /** 提示语义 */
    tone: FeedbackNoticeTone;
    /** 标题 */
    title: string;
    /** 详细说明 */
    message: string;
    /** 可选额外样式 */
    className?: string;
}

/**
 * 页面局部反馈提示, 统一成功, 信息, 错误三类视觉
 *
 * @param props 组件入参
 * @returns 反馈提示节点
 */
export function FeedbackNotice({tone, title, message, className}: FeedbackNoticeProps) {
    return (
        <Alert
            variant={tone === "error" ? "destructive" : "default"}
            className={cn(
                tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-950" : null,
                tone === "info" ? "border-border bg-card" : null,
                className,
            )}
        >
            <FeedbackNoticeIcon tone={tone}/>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

/**
 * 根据提示语义渲染对应图标
 *
 * @param props 图标入参
 * @returns 图标节点
 */
function FeedbackNoticeIcon({tone}: { tone: FeedbackNoticeTone }) {
    if (tone === "success") {
        return <CheckCircle2 className="size-4"/>;
    }

    if (tone === "error") {
        return <AlertCircle className="size-4"/>;
    }

    return <Info className="size-4"/>;
}
