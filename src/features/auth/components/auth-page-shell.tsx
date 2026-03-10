import type {ReactNode} from "react";
import {CircleCheckBig} from "lucide-react";

import {cn} from "@/lib/utils";

/**
 * 移动端摘要样式枚举, 控制小屏顶部信息区样式
 */
type MobileSummaryVariant = "highlights" | "title" | "none";

/**
 * 认证页面通用壳层属性, 用于登录, 注册, 忘记密码页面
 */
interface AuthPageShellProps {
    eyebrow: string;
    title: string;
    description: string;
    highlights: string[];
    children: ReactNode;
    compactAside?: boolean;
    subtleAside?: boolean;
    panelMaxWidthClassName?: string;
    padHighlightCount?: number;
    mobileHighlightCount?: number;
    mobileSummaryVariant?: MobileSummaryVariant;
}

/**
 * 渲染响应式认证页面壳层, 在一个组件中支持 mobile, pad, pc 布局
 *
 * @param props 认证壳层属性
 * @returns 响应式认证壳层
 */
export function AuthPageShell({
                                  eyebrow,
                                  title,
                                  description,
                                  highlights,
                                  children,
                                  compactAside = false,
                                  subtleAside = false,
                                  panelMaxWidthClassName = "max-w-full md:max-w-[560px]",
                                  padHighlightCount = 3,
                                  mobileHighlightCount = 2,
                                  mobileSummaryVariant = "highlights",
                              }: AuthPageShellProps) {
    const visiblePadHighlights = highlights.slice(0, Math.max(0, padHighlightCount));
    const visibleMobileHighlights = highlights.slice(0, Math.max(0, mobileHighlightCount));

    return (
        <section className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 xl:py-10">
                <div className="grid min-h-[calc(100vh-3rem)] gap-6 md:gap-8 xl:grid-cols-12 xl:gap-8">
                    <aside
                        className={cn(
                            "hidden rounded-2xl border border-border p-8 xl:col-span-5 xl:flex xl:flex-col xl:justify-between",
                            subtleAside
                                ? "bg-secondary/40"
                                : "bg-linear-to-br from-background via-secondary to-accent",
                            compactAside ? "xl:py-10" : "xl:py-12",
                        )}
                    >
                        <div className="space-y-6">
                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                {eyebrow}
                            </p>
                            <h1 className="text-3xl leading-tight font-semibold text-foreground">{title}</h1>
                            <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
                        </div>
                        <ul className="space-y-4">
                            {highlights.slice(0, 3).map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-foreground">
                                    <CircleCheckBig className="mt-0.5 size-4 text-primary" aria-hidden="true"/>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="mx-auto flex w-full items-center justify-center xl:col-span-7">
                        <div className={cn("w-full space-y-4 md:space-y-6", panelMaxWidthClassName)}>
                            <div
                                className={cn(
                                    "hidden rounded-2xl border border-border p-6 md:block xl:hidden",
                                    subtleAside
                                        ? "bg-secondary/40"
                                        : "bg-linear-to-r from-background via-secondary to-accent",
                                )}
                            >
                                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    {eyebrow}
                                </p>
                                <h2 className="mt-2 text-xl leading-tight font-semibold text-foreground">{title}</h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                                {visiblePadHighlights.length > 0 ? (
                                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                        {visiblePadHighlights.map((item) => (
                                            <li key={item} className="flex items-start gap-2 text-sm leading-6 text-foreground">
                                                <CircleCheckBig className="mt-0.5 size-4 text-primary" aria-hidden="true"/>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>

                            {mobileSummaryVariant === "highlights" ? (
                                <div className="space-y-2 rounded-2xl border border-border bg-card p-4 md:hidden">
                                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                        {eyebrow}
                                    </p>
                                    <ul className="space-y-2">
                                        {visibleMobileHighlights.map((item) => (
                                            <li key={item} className="flex items-start gap-2 text-sm leading-6 text-foreground">
                                                <CircleCheckBig className="mt-0.5 size-4 text-primary" aria-hidden="true"/>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            {mobileSummaryVariant === "title" ? (
                                <div className="space-y-2 rounded-2xl border border-border bg-card p-4 md:hidden">
                                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                        {eyebrow}
                                    </p>
                                    <h2 className="text-lg leading-tight font-semibold text-foreground">{title}</h2>
                                    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                                </div>
                            ) : null}

                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </section>
    );
}
