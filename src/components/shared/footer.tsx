import type * as React from "react";

import {cn} from "@/lib/utils";

export interface FooterLink {
    label: React.ReactNode;
    href: string;
}

export interface FooterSection {
    title: React.ReactNode;
    links: FooterLink[];
}

export interface FooterProps extends React.ComponentProps<"footer"> {
    brand?: React.ReactNode;
    description?: React.ReactNode;
    sections?: FooterSection[];
    legal?: React.ReactNode;
}

export function Footer({brand, description, sections = [], legal, className, ...props}: FooterProps) {
    return (
        <footer className={cn("border-t bg-background", className)} {...props}>
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_2fr]">
                <div className="flex flex-col gap-3">
                    {brand ? <div className="font-serif text-xl font-medium text-text-primary">{brand}</div> : null}
                    {description ? <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p> : null}
                    {legal ? <p className="text-sm text-muted-foreground">{legal}</p> : null}
                </div>
                {sections.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {sections.map((section, index) => (
                            <section key={index} className="flex flex-col gap-3">
                                <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                                <ul className="flex flex-col gap-2">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <a className="text-sm text-muted-foreground hover:text-foreground" href={link.href}>
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                ) : null}
            </div>
        </footer>
    );
}
