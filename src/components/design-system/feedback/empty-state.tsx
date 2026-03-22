import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../primitives";

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card variant="nested" className={cn("min-h-52 justify-center", className)}>
      <CardHeader className="gap-3">
        {eyebrow ? (
          <p className="ds-type-label-md text-[var(--ds-on-surface-muted)] uppercase tracking-[0.18em]">
            {eyebrow}
          </p>
        ) : null}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action ? <CardContent className="pt-0">{action}</CardContent> : null}
    </Card>
  );
}
