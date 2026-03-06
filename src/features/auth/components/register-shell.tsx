import type {ReactNode} from "react";

import {Link} from "@/i18n/navigation";

/**
 * 注册页壳层入参
 */
interface RegisterShellProps {
    /** 页面标题 */
    title: string;
    /** 页面描述 */
    description?: string;
    /** 注册表单主体 */
    children: ReactNode;
    /** 卡片下方扩展区域 */
    footer?: ReactNode;
}

/**
 * 注册页壳层, 参考 signup10 双栏结构, 并与全站 Design Token 保持一致
 *
 * @param props 组件入参
 * @returns 注册页布局
 */
export function RegisterShell({title, description, children, footer}: RegisterShellProps) {
    return (
        <section className="relative min-h-screen overflow-hidden bg-background">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left_top,oklch(0.97_0_0),transparent_58%)]"
            />
            <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-10">
                    <div className="mx-auto flex w-full max-w-xl flex-col justify-center py-4 lg:py-8">
                        <div className="mb-8 flex animate-in fade-in-0 slide-in-from-top-1 items-center gap-3 duration-500">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-3 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
                            >
                                <span className="size-2.5 rounded-sm bg-primary"/>
                                <span>International Shopping</span>
                            </Link>
                        </div>

                        <div className="animate-in fade-in-0 slide-in-from-bottom-2 rounded-xl border bg-card/95 p-6 text-card-foreground shadow-sm duration-500 sm:p-8">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
                                {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
                            </div>
                            <div className="mt-6">{children}</div>
                        </div>

                        {footer ? <div className="mt-4 text-sm text-muted-foreground">{footer}</div> : null}
                    </div>

                    <div className="relative hidden overflow-hidden rounded-2xl border bg-muted/35 lg:block">
                        <div
                            aria-hidden
                            className="absolute inset-0 bg-[linear-gradient(140deg,oklch(0.98_0_0)_0%,oklch(0.95_0_0)_48%,oklch(0.92_0_0)_100%)]"
                        />
                        <div className="absolute -left-16 top-24 size-52 rounded-3xl bg-background/70 blur-2xl"/>
                        <div className="absolute bottom-12 right-8 size-44 rounded-3xl bg-foreground/10 blur-xl"/>
                        <div className="absolute inset-x-10 top-10 rounded-xl border bg-background/70 p-6 backdrop-blur-sm"/>
                    </div>
                </div>
            </div>
        </section>
    );
}
