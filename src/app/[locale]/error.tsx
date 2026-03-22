"use client";

import {useEffect} from "react";

import { Button, DesignSystemPageShell, ErrorState } from "@/components/design-system";

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
 * locale 级运行时错误页, 使用新的设计系统错误 anatomy
 *
 * @param props 错误页入参
 * @returns 错误页视图
 */
export default function LocaleErrorPage({error, reset}: LocaleErrorPageProps) {
    useEffect(() => {
        console.error("Unhandled locale error", error);
    }, [error]);

    return (
        <DesignSystemPageShell patternName="userProfileDashboard">
            <ErrorState
                title="The page could not be rendered."
                description="The rebuild is now running on the design-system primitives, but this route still hit an unexpected runtime error."
                traceId={error.digest}
                backendMessage={error.message}
                action={
                    <Button onClick={reset}>
                        Retry
                    </Button>
                }
            />
        </DesignSystemPageShell>
    );
}
