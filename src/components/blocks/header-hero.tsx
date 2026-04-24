import type * as React from "react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";

export interface HeaderHeroAction {
    label: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: React.ComponentProps<typeof Button>["variant"];
}

export interface HeaderHeroProps extends Omit<React.ComponentProps<"section">, "title"> {
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: HeaderHeroAction[];
    media?: React.ReactNode;
}

export function HeaderHero({eyebrow, title, description, actions, media, className, ...props}: HeaderHeroProps) {
    return (
        <section className={cn("grid gap-8 py-12 md:grid-cols-[1fr_0.9fr] md:items-center", className)} {...props}>
            <div className="flex max-w-3xl flex-col gap-5">
                {eyebrow ? <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">{eyebrow}</p> : null}
                <h1 className="font-serif text-4xl leading-none text-text-primary md:text-6xl">{title}</h1>
                {description ? <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p> : null}
                {actions?.length ? (
                    <div className="flex flex-wrap gap-3">
                        {actions.map((action, index) => (
                            <Button key={index} onClick={action.onClick} type="button" variant={action.variant ?? "default"}>
                                {action.label}
                            </Button>
                        ))}
                    </div>
                ) : null}
            </div>
            {media ? <div className="min-w-0">{media}</div> : null}
        </section>
    );
}
