import type * as React from "react"
import { Menu, Search, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AuthNavbarCopy {
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
}

export interface AuthNavbarProps extends React.ComponentProps<"header"> {
    copy: AuthNavbarCopy
    brandHref?: string
}

export interface AuthNavbarSearchInputProps
    extends Omit<React.ComponentProps<"input">, "type" | "size"> {
    inputClassName?: string
}

export function AuthNavbar({
                               copy,
                               brandHref = "#",
                               className,
                               ...props
                           }: AuthNavbarProps) {
    return (
        <header
            className={cn(
                "flex h-15 shrink-0 items-center bg-white/20 px-6 py-4 backdrop-blur-[6px] xl:h-19",
                className
            )}
            {...props}
        >
            <div className="hidden w-full items-center justify-between xl:flex">
                <div className="flex items-center gap-8">
                    <AuthBrand brand={copy.brand} href={brandHref} />
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
                    <AuthNavbarSearchInput
                        aria-label={copy.searchLabel}
                        placeholder={copy.searchPlaceholder}
                    />
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={copy.cartLabel}>
                        <ShoppingBag />
                    </Button>
                </div>
            </div>

            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center xl:hidden">
                <div className="flex items-center gap-6 justify-self-start">
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={copy.menuLabel}>
                        <Menu />
                    </Button>
                </div>
                <AuthBrand brand={copy.brand} href={brandHref} />
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

export function AuthNavbarSearchInput({
                                          className,
                                          inputClassName,
                                          placeholder,
                                          ...props
                                      }: AuthNavbarSearchInputProps) {
    return (
        <label
            className={cn(
                "flex h-10.75 w-62 items-center gap-2 rounded-full bg-zinc-100/50 px-4 py-1 text-auth-muted transition-colors focus-within:bg-zinc-100/70 focus-within:ring-2 focus-within:ring-ring/35",
                className
            )}
        >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <input
                type="search"
                data-slot="auth-navbar-search-input"
                className={cn(
                    "h-8.75 w-48 min-w-0 bg-transparent px-3 py-2 text-sm leading-none font-normal text-auth-ink outline-none placeholder:text-auth-muted",
                    inputClassName
                )}
                placeholder={placeholder}
                {...props}
            />
        </label>
    )
}

function AuthBrand({ brand, href }: { brand: string; href: string }) {
    return (
        <a className="flex h-7 items-center justify-center gap-2.5 text-auth-ink" href={href}>
            <span className="text-2xl leading-6 font-semibold" aria-hidden="true">
                &
            </span>
            <span className="font-serif text-xl leading-7 font-normal whitespace-nowrap italic">
                {brand}
            </span>
        </a>
    )
}
