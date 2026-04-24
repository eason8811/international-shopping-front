import type * as React from "react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

export interface OrderCardMetaItem {
    label: React.ReactNode;
    value: React.ReactNode;
}

export interface OrderCardAction {
    label: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: React.ComponentProps<typeof Button>["variant"];
}

export interface OrderCardProps extends React.ComponentProps<"article"> {
    orderNumber: React.ReactNode;
    placedAt?: React.ReactNode;
    status?: React.ReactNode;
    total?: React.ReactNode;
    meta?: OrderCardMetaItem[];
    actions?: OrderCardAction[];
}

export function OrderCard({
    orderNumber,
    placedAt,
    status,
    total,
    meta,
    actions,
    className,
    ...props
}: OrderCardProps) {
    return (
        <Card asChild className={cn("rounded-card shadow-none", className)}>
            <article {...props}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <CardTitle>{orderNumber}</CardTitle>
                        {placedAt ? <p className="text-sm text-muted-foreground">{placedAt}</p> : null}
                    </div>
                    {status ? <div>{status}</div> : null}
                </CardHeader>
                {(total || meta?.length) && (
                    <CardContent className="flex flex-col gap-4">
                        {total ? (
                            <div className="flex items-baseline justify-between gap-4">
                                <span className="text-sm text-muted-foreground">Total</span>
                                <strong className="font-mono text-lg font-semibold text-text-primary">{total}</strong>
                            </div>
                        ) : null}
                        {meta?.length ? (
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                {meta.map((item, index) => (
                                    <div key={index} className="flex flex-col gap-1">
                                        <dt className="text-muted-foreground">{item.label}</dt>
                                        <dd className="font-medium text-foreground">{item.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : null}
                    </CardContent>
                )}
                {actions?.length ? (
                    <CardFooter className="flex flex-wrap gap-2">
                        {actions.map((action, index) => (
                            <Button key={index} onClick={action.onClick} type="button" variant={action.variant ?? "outline"}>
                                {action.label}
                            </Button>
                        ))}
                    </CardFooter>
                ) : null}
            </article>
        </Card>
    );
}
