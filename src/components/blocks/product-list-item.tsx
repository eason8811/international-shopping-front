import type * as React from "react";
import Image from "next/image";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";

export interface ProductListItemImage {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    unoptimized?: boolean;
}

export interface ProductListItemAction {
    label: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: React.ComponentProps<typeof Button>["variant"];
}

export interface ProductListItemProps extends Omit<React.ComponentProps<"article">, "title"> {
    image?: ProductListItemImage;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    details?: React.ReactNode[];
    price: React.ReactNode;
    quantity?: React.ReactNode;
    status?: React.ReactNode;
    actions?: ProductListItemAction[];
}

export function ProductListItem({
    image,
    title,
    subtitle,
    details,
    price,
    quantity,
    status,
    actions,
    className,
    ...props
}: ProductListItemProps) {
    return (
        <Card asChild className={cn("rounded-card shadow-none", className)}>
            <article {...props}>
                <CardContent className="grid gap-4 p-4 sm:grid-cols-[7rem_1fr_auto]">
                    <div className="aspect-square overflow-hidden rounded-md bg-surface-section">
                        {image ? (
                            <Image
                                alt={image.alt}
                                className="size-full object-cover"
                                height={image.height ?? 160}
                                unoptimized={image.unoptimized ?? image.src.endsWith(".svg")}
                                sizes="(min-width: 640px) 7rem, 100vw"
                                src={image.src}
                                width={image.width ?? 160}
                            />
                        ) : null}
                    </div>
                    <div className="flex min-w-0 flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
                        </div>
                        {details?.length ? (
                            <dl className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                                {details.map((detail, index) => (
                                    <div key={index}>{detail}</div>
                                ))}
                            </dl>
                        ) : null}
                        {status ? <div>{status}</div> : null}
                        {actions?.length ? (
                            <div className="flex flex-wrap gap-2">
                                {actions.map((action, index) => (
                                    <Button key={index} onClick={action.onClick} type="button" variant={action.variant ?? "outline"}>
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    <div className="flex flex-row items-end justify-between gap-4 sm:flex-col sm:items-end">
                        <strong className="font-mono text-base font-semibold text-text-primary">{price}</strong>
                        {quantity ? <span className="text-sm text-muted-foreground">{quantity}</span> : null}
                    </div>
                </CardContent>
            </article>
        </Card>
    );
}
