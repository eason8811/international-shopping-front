import type * as React from "react";

import {cn} from "@/lib/utils";

export interface SidebarItem {
    label: React.ReactNode;
    href: string;
    isActive?: boolean;
    badge?: React.ReactNode;
}

export interface SidebarSection {
    title?: React.ReactNode;
    items: SidebarItem[];
}

export interface SidebarProps extends React.ComponentProps<"aside"> {
    label?: string;
    sections: SidebarSection[];
}

export function Sidebar({label = "Section navigation", sections, className, ...props}: SidebarProps) {
    return (
        <aside className={cn("w-full border-r bg-background", className)} {...props}>
            <nav aria-label={label} className="flex flex-col gap-6 p-4">
                {sections.map((section, sectionIndex) => (
                    <section key={sectionIndex} className="flex flex-col gap-2">
                        {section.title ? (
                            <h2 className="px-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
                                {section.title}
                            </h2>
                        ) : null}
                        <ul className="flex flex-col gap-1">
                            {section.items.map((item) => (
                                <li key={item.href}>
                                    <a
                                        aria-current={item.isActive ? "page" : undefined}
                                        className={cn(
                                            "flex items-center justify-between gap-3 rounded-control px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                                            item.isActive && "bg-muted text-foreground"
                                        )}
                                        href={item.href}
                                    >
                                        <span>{item.label}</span>
                                        {item.badge}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </nav>
        </aside>
    );
}
