import type * as React from "react"
import { Menu, Search, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AuthShellCopy {
    brand: string
    nav: {
        collections: string
        newArrivals: string
        support: string
    }
    searchPlaceholder: string
    menuLabel: string
    searchLabel: string
    cartLabel: string
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
            <div className="pointer-events-none absolute -top-27 -left-16 h-96 w-80 rounded-full bg-auth-blur-cool opacity-40 blur-[60px] lg:h-153.5 lg:w-lg" />
            <div className="pointer-events-none absolute -right-16 -bottom-18 h-80.25 w-70.25 rounded-full bg-auth-blur-warm opacity-40 blur-[50px] lg:h-128 lg:w-md" />

            <div className="relative z-10 flex min-h-dvh flex-col">
                <AuthNavbar copy={copy} />
                <div className="flex flex-1 items-stretch justify-center overflow-hidden">
                    <section className="flex min-h-[calc(100dvh-60px)] w-full justify-center px-8 py-12 lg:min-h-[calc(100dvh-76px)] lg:max-w-154 lg:px-16 lg:py-16">
                        <div className="flex w-full max-w-122 flex-col items-center justify-center gap-12">
                            {children}
                        </div>
                    </section>
                    <AuthPicturePanel copy={copy} className="hidden lg:flex" />
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

function AuthNavbar({ copy }: { copy: AuthShellCopy }) {
    return (
        <header className="flex h-15 shrink-0 items-center bg-white/20 px-6 py-4 backdrop-blur-[6px] lg:h-19">
            <div className="hidden w-full items-center justify-between lg:flex">
                <div className="flex items-center gap-8">
                    <AuthBrand brand={copy.brand} />
                    <nav aria-label="Primary" className="flex items-center gap-10">
                        <a className="text-base leading-6 font-medium text-auth-muted" href="#">
                            {copy.nav.collections}
                        </a>
                        <a className="text-base leading-6 font-medium text-auth-muted" href="#">
                            {copy.nav.newArrivals}
                        </a>
                        <a className="text-base leading-6 font-medium text-auth-muted" href="#">
                            {copy.nav.support}
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 rounded-full bg-zinc-100/50 px-4 py-1 text-auth-muted">
                        <Search className="size-4" aria-hidden="true" />
                        <span className="w-48 px-3 py-2 text-sm leading-none font-normal">
                            {copy.searchPlaceholder}
                        </span>
                    </div>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={copy.cartLabel}>
                        <ShoppingBag />
                    </Button>
                </div>
            </div>

            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center lg:hidden">
                <div className="flex items-center gap-6 justify-self-start">
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={copy.menuLabel}>
                        <Menu />
                    </Button>
                </div>
                <AuthBrand brand={copy.brand} />
                <div className="flex items-center gap-4 justify-self-end">
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={copy.searchLabel}>
                        <Search />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={copy.cartLabel}>
                        <ShoppingBag />
                    </Button>
                </div>
            </div>
        </header>
    )
}

function AuthBrand({ brand }: { brand: string }) {
    return (
        <a className="flex h-7 items-center justify-center gap-2.5 text-auth-ink" href="#">
            <span className="text-2xl leading-6 font-semibold" aria-hidden="true">
                &
            </span>
            <span className="font-serif text-xl leading-7 font-normal whitespace-nowrap italic">
                {brand}
            </span>
        </a>
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
