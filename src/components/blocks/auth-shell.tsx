import type * as React from "react"

import { AuthNavbar, type AuthNavbarCopy } from "@/components/blocks/auth-navbar"
import { cn } from "@/lib/utils"

export interface AuthShellCopy extends AuthNavbarCopy {
    quote: string
    quoteAuthor: string
}

export interface AuthPageShellProps extends React.ComponentProps<"main"> {
    copy: AuthShellCopy
}

export interface AuthHeroTextProps extends Omit<React.ComponentProps<"div">, "title"> {
    title: React.ReactNode
    subtitle: React.ReactNode
}

export function AuthPageShell({
                                  copy,
                                  children,
                                  className,
                                  ...props
                              }: AuthPageShellProps) {
    return (
        <main
            className={cn(
                "relative min-h-dvh overflow-hidden bg-auth-background text-auth-ink",
                className
            )}
            {...props}
        >
            <div className="pointer-events-none absolute -top-27 -left-16 h-96 w-80 rounded-full bg-auth-blur-cool opacity-40 blur-[60px] xl:h-153.5 xl:w-lg" />
            <div className="pointer-events-none absolute -right-16 -bottom-18 h-80.25 w-70.25 rounded-full bg-auth-blur-warm opacity-40 blur-[50px] xl:h-128 xl:w-md" />

            <div className="relative z-10 flex min-h-dvh flex-col">
                <AuthNavbar copy={copy} />
                <div className="flex flex-1 items-stretch justify-center overflow-hidden">
                    <section className="flex min-h-[calc(100dvh-60px)] w-full justify-center px-8 py-12 xl:min-h-[calc(100dvh-76px)] xl:min-w-154 xl:basis-2/5 xl:shrink xl:px-16 xl:py-16">
                        <div className="flex w-full max-w-122 flex-col items-center justify-center gap-12">
                            {children}
                        </div>
                    </section>
                    <AuthPicturePanel copy={copy} className="hidden xl:flex xl:min-w-0 xl:basis-3/5 xl:grow" />
                </div>
            </div>
        </main>
    )
}

export function AuthHeroText({
                                 title,
                                 subtitle,
                                 className,
                                 ...props
                             }: AuthHeroTextProps) {
    return (
        <div className={cn("flex w-full flex-col items-center gap-3 text-center", className)} {...props}>
            <h1 className="font-serif text-[48px] leading-12 font-normal tracking-normal text-auth-ink italic">
                {title}
            </h1>
            <p className="text-[15px] leading-6 font-normal tracking-[0.4px] text-auth-muted">
                {subtitle}
            </p>
        </div>
    )
}

function AuthPicturePanel({
                              copy,
                              className,
                          }: {
    copy: AuthShellCopy
    className?: string
}) {
    return (
        <aside
            className={cn(
                "auth-picture-checkerboard relative flex-1 flex-col items-center justify-end overflow-hidden px-16 py-12",
                className
            )}
        >
            <div className="flex w-full flex-col items-end justify-center rounded-2xl bg-auth-ink/20 px-9 py-6 text-white backdrop-blur-sm">
                <blockquote className="min-w-full font-serif text-2xl leading-9 font-medium tracking-[1px] italic">
                    {copy.quote}
                </blockquote>
                <p className="text-base leading-9 font-medium tracking-[1px] text-[#9c9c9c]">
                    {copy.quoteAuthor}
                </p>
            </div>
        </aside>
    )
}
