"use client";

import {useTranslations} from "next-intl";
import {useEffect} from "react";

import {TrackedErrorState} from "@/components/error/tracked-error-state";

/**
 * locale 错误页入参, 由 Next.js 错误边界在运行时注入
 */
interface LocaleErrorPageProps {
    /** 原始错误对象, digest 可作为追踪标识 */
    error: Error & { digest?: string };
    /** 错误恢复函数, 触发当前路由段重新渲染 */
    reset: () => void;
}

/**
 * locale 级运行时错误页, 复用统一错误展示组件, 保证错误体验一致
 *
 * @param props 错误页入参
 * @returns 错误页视图
 */
export default function LocaleErrorPage({error, reset}: LocaleErrorPageProps) {
    const t = useTranslations("UnhandledError");

    useEffect(() => {
        console.error(t("logPrefix"), error);
    }, [error, t]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
            <main className="w-full max-w-3xl">
                <TrackedErrorState
                    error={{
                        status: 500,
                        code: "INTERNAL_SERVER_ERROR",
                        message: error.message || t("fallbackMessage"),
                        traceId: error.digest,
                    }}
                    onRetry={reset}
                />
            </main>
        </div>
    );
}
