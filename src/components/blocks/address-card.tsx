import type * as React from "react";

import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

export interface AddressCardAction {
    label: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export interface AddressCardProps extends React.ComponentProps<"article"> {
    name: React.ReactNode;
    phone?: React.ReactNode;
    lines: React.ReactNode[];
    isDefault?: boolean;
    defaultLabel?: React.ReactNode;
    actions?: AddressCardAction[];
}

export function AddressCard({
    name,
    phone,
    lines,
    isDefault = false,
    defaultLabel = "Default",
    actions,
    className,
    ...props
}: AddressCardProps) {
    return (
        <Card asChild className={cn("rounded-card shadow-none", className)}>
            <article {...props}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <CardTitle>{name}</CardTitle>
                        {phone ? <p className="text-sm text-muted-foreground">{phone}</p> : null}
                    </div>
                    {isDefault ? <Badge variant="secondary">{defaultLabel}</Badge> : null}
                </CardHeader>
                <CardContent>
                    <address className="flex flex-col gap-1 text-sm not-italic text-foreground">
                        {lines.map((line, index) => (
                            <span key={index}>{line}</span>
                        ))}
                    </address>
                </CardContent>
                {actions?.length ? (
                    <CardFooter className="flex flex-wrap gap-2">
                        {actions.map((action, index) => (
                            <Button key={index} onClick={action.onClick} type="button" variant="outline">
                                {action.label}
                            </Button>
                        ))}
                    </CardFooter>
                ) : null}
            </article>
        </Card>
    );
}
