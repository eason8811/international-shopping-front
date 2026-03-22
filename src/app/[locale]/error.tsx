"use client";

import {useEffect} from "react";

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
    useEffect(() => {
        console.error("Unhandled locale error", error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
            <main className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    System state
                </p>
                <h1 className="mt-4 text-3xl font-semibold text-foreground">
                    Frontend is being rebuilt on the new design system.
                </h1>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Runtime UI has been intentionally stripped back. Existing BFF and downstream request flows remain
                    available during the rewrite.
                </p>
                {error.message ? (
                    <pre className="mt-6 overflow-x-auto rounded-2xl bg-muted px-4 py-3 text-xs leading-6 text-foreground">
                        {error.message}
                    </pre>
                ) : null}
                {error.digest ? (
                    <p className="mt-4 text-xs text-muted-foreground">Trace: {error.digest}</p>
                ) : null}
                <button
                    type="button"
                    onClick={reset}
                    className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                    Retry
                </button>
            </main>
        </div>
    );
}
