import type * as React from "react";

import {cn} from "@/lib/utils";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export interface ShipmentCardMetaItem {
    label: React.ReactNode;
    value: React.ReactNode;
}

export interface ShipmentCardProps extends Omit<React.ComponentProps<"article">, "title"> {
    title?: React.ReactNode;
    status?: React.ReactNode;
    carrier?: React.ReactNode;
    trackingNumber?: React.ReactNode;
    estimate?: React.ReactNode;
    meta?: ShipmentCardMetaItem[];
}

export function ShipmentCard({
    title = "Shipment",
    status,
    carrier,
    trackingNumber,
    estimate,
    meta,
    className,
    ...props
}: ShipmentCardProps) {
    return (
        <Card asChild className={cn("rounded-card shadow-none", className)}>
            <article {...props}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <CardTitle>{title}</CardTitle>
                    {status ? <div>{status}</div> : null}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        {carrier ? (
                            <div className="flex flex-col gap-1">
                                <dt className="text-muted-foreground">Carrier</dt>
                                <dd className="font-medium text-foreground">{carrier}</dd>
                            </div>
                        ) : null}
                        {trackingNumber ? (
                            <div className="flex flex-col gap-1">
                                <dt className="text-muted-foreground">Tracking</dt>
                                <dd className="font-mono text-foreground">{trackingNumber}</dd>
                            </div>
                        ) : null}
                        {estimate ? (
                            <div className="flex flex-col gap-1">
                                <dt className="text-muted-foreground">Estimate</dt>
                                <dd className="font-medium text-foreground">{estimate}</dd>
                            </div>
                        ) : null}
                        {meta?.map((item, index) => (
                            <div key={index} className="flex flex-col gap-1">
                                <dt className="text-muted-foreground">{item.label}</dt>
                                <dd className="font-medium text-foreground">{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </CardContent>
            </article>
        </Card>
    );
}
