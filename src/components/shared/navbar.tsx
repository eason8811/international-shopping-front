import type * as React from "react";
import {Menu, Search, ShoppingBag, UserRound} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {IconButton} from "@/components/ui/icon-button";

export interface NavbarItem {
    label: React.ReactNode;
    href: string;
    isActive?: boolean;
}

export interface NavbarProps extends React.ComponentProps<"header"> {
    brand: React.ReactNode;
    brandHref?: string;
    items?: NavbarItem[];
    searchLabel?: string;
    accountLabel?: string;
    cartLabel?: string;
    actions?: React.ReactNode;
}

export function Navbar({
    brand,
    brandHref = "/",
    items = [],
    searchLabel = "Search",
    accountLabel = "Account",
    cartLabel = "Shopping cart",
    actions,
    className,
    ...props
}: NavbarProps) {
    return (
        <header className={cn("border-b bg-background", className)} {...props}>
            <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-4">
                <a className="font-serif text-xl font-medium text-text-primary" href={brandHref}>
                    {brand}
                </a>
                {items.length ? (
                    <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
                        {items.map((item) => (
                            <a
                                key={item.href}
                                aria-current={item.isActive ? "page" : undefined}
                                className={cn(
                                    "rounded-control px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                                    item.isActive && "bg-muted text-foreground"
                                )}
                                href={item.href}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                ) : null}
                <div className="ml-auto flex items-center gap-2">
                    {actions}
                    <IconButton icon={Search} label={searchLabel} variant="ghost" />
                    <IconButton icon={UserRound} label={accountLabel} variant="ghost" />
                    <IconButton icon={ShoppingBag} label={cartLabel} variant="ghost" />
                    <Button className="md:hidden" size="icon" variant="ghost" aria-label="Open navigation">
                        <Menu data-icon="inline-start" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
