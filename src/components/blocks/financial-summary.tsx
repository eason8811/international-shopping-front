import type * as React from "react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";

export interface FinancialSummaryLine {
    id: string;
    label: React.ReactNode;
    value: React.ReactNode;
    description?: React.ReactNode;
    tone?: "default" | "muted" | "success" | "danger";
}

export interface FinancialSummaryAction {
    label: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
}

export interface FinancialSummaryProps extends Omit<React.ComponentProps<"section">, "title"> {
    title?: React.ReactNode;
    lines: FinancialSummaryLine[];
    totalLabel?: React.ReactNode;
    total: React.ReactNode;
    primaryAction?: FinancialSummaryAction;
    secondaryAction?: FinancialSummaryAction;
    footer?: React.ReactNode;
}

const lineToneClassName: Record<NonNullable<FinancialSummaryLine["tone"]>, string> = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    success: "text-status-success-foreground",
    danger: "text-status-danger-foreground",
};

export function FinancialSummary({
    title = "Summary",
    lines,
    totalLabel = "Total",
    total,
    primaryAction,
    secondaryAction,
    footer,
    className,
    ...props
}: FinancialSummaryProps) {
    return (
        <Card asChild className={cn("rounded-card shadow-none", className)}>
            <section {...props}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <dl className="flex flex-col gap-3">
                        {lines.map((line) => (
                            <div key={line.id} className="flex items-start justify-between gap-4 text-sm">
                                <dt className="flex flex-col gap-1 text-muted-foreground">
                                    <span>{line.label}</span>
                                    {line.description ? <span className="text-xs">{line.description}</span> : null}
                                </dt>
                                <dd className={cn("text-right font-medium", lineToneClassName[line.tone ?? "default"])}>
                                    {line.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <Separator />
                    <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm font-medium text-foreground">{totalLabel}</span>
                        <strong className="font-mono text-xl font-semibold text-text-primary">{total}</strong>
                    </div>
                </CardContent>
                {(primaryAction || secondaryAction || footer) && (
                    <CardFooter className="flex flex-col gap-3">
                        {primaryAction ? (
                            <Button className="w-full" disabled={primaryAction.disabled} onClick={primaryAction.onClick}>
                                {primaryAction.label}
                            </Button>
                        ) : null}
                        {secondaryAction ? (
                            <Button
                                className="w-full"
                                disabled={secondaryAction.disabled}
                                onClick={secondaryAction.onClick}
                                variant="outline"
                            >
                                {secondaryAction.label}
                            </Button>
                        ) : null}
                        {footer ? <div className="w-full text-sm text-muted-foreground">{footer}</div> : null}
                    </CardFooter>
                )}
            </section>
        </Card>
    );
}
