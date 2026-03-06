import type {ReactNode} from "react";

import {Link} from "@/i18n/navigation";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

/**
 * 认证页面统一壳层入参
 */
interface AuthShellProps {
    /** 页面标题 */
    title: string;
    /** 页面描述 */
    description?: string;
    /** 表单主体 */
    children: ReactNode;
    /** 卡片底部扩展区域 */
    footer?: ReactNode;
}

/**
 * 认证页面统一壳层, 保持登录, 注册, 找回密码风格一致
 *
 * @param props 壳层入参
 * @returns 认证页面布局
 */
export function AuthShell({title, description, children, footer}: AuthShellProps) {
    return (
        <section className="relative min-h-screen overflow-hidden bg-background">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.97_0_0),transparent_60%)]"
            />
            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex justify-center animate-in fade-in-0 slide-in-from-top-1 duration-500">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
                        >
                            <span className="size-2.5 rounded-sm bg-primary"/>
                            <span>International Shopping</span>
                        </Link>
                    </div>
                    <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                        <CardHeader className="space-y-2 text-center">
                            <CardTitle>{title}</CardTitle>
                            {description ? <CardDescription>{description}</CardDescription> : null}
                        </CardHeader>
                        <CardContent className="space-y-4">{children}</CardContent>
                    </Card>
                    {footer ? <div className="mt-4 text-sm text-muted-foreground">{footer}</div> : null}
                </div>
            </div>
        </section>
    );
}
