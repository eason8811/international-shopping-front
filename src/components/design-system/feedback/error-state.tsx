import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "../primitives";

export function ErrorState({
  title,
  description,
  traceId,
  backendMessage,
  action,
  className,
}: {
  title: string;
  description: string;
  traceId?: string;
  backendMessage?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card variant="nested" className={cn("border border-[color:var(--ds-destructive-soft)]", className)}>
      <CardHeader className="gap-3">
        <Badge tone="destructive" size="sm">
          Error
        </Badge>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {traceId || backendMessage || action ? (
        <CardContent className="gap-4 pt-0">
          {traceId ? (
            <p className="ds-type-body-md text-[var(--ds-on-surface-muted)]">Trace ID: {traceId}</p>
          ) : null}
          {backendMessage ? (
            <pre className="overflow-x-auto rounded-[var(--radius-lg)] bg-[var(--ds-surface-container-high)] px-4 py-3 ds-type-body-md text-[var(--ds-on-surface)]">
              {backendMessage}
            </pre>
          ) : null}
          {action}
        </CardContent>
      ) : null}
    </Card>
  );
}
