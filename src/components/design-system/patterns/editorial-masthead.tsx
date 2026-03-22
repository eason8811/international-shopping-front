import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Badge, Button, Card, CardContent } from "../primitives";

export function EditorialMasthead({
  eyebrow,
  title,
  description,
  metadata,
  primaryAction,
  secondaryAction,
  visual,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  metadata?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  visual?: ReactNode;
  className?: string;
}) {
  return (
    <Card
      variant="editorial"
      className={cn(
        "overflow-hidden bg-[linear-gradient(180deg,var(--ds-gradient-ink-soft),transparent)]",
        className,
      )}
    >
      <CardContent className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(0,7fr)_minmax(18rem,5fr)] lg:items-center lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5">
          <Badge tone="neutral" size="sm" className="self-start">
            {eyebrow}
          </Badge>
          {metadata ? (
            <p className="ds-type-data-sm text-[var(--ds-on-surface-muted)] uppercase tracking-[0.18em]">
              {metadata}
            </p>
          ) : null}
          <h1 className="ds-type-display-lg text-[var(--ds-on-surface-strong)]">{title}</h1>
          <p className="ds-type-body-lg max-w-2xl text-[var(--ds-on-surface-muted)]">{description}</p>
          {primaryAction || secondaryAction ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {primaryAction}
              {secondaryAction}
            </div>
          ) : null}
        </div>
        <div className="flex min-h-72 flex-col justify-between rounded-[var(--radius-xl)] bg-[var(--ds-surface-container-high)] p-6">
          {visual ?? (
            <>
              <div className="flex gap-3">
                <div className="size-3 rounded-full bg-[var(--ds-surface-container-highest)]" />
                <div className="size-3 rounded-full bg-[var(--ds-surface-container-lowest)]" />
                <div className="size-3 rounded-full bg-[var(--ds-primary)]" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="h-32 rounded-[var(--radius-xl)] bg-[var(--ds-surface-container-lowest)]" />
                <div className="flex gap-4">
                  <div className="h-20 flex-1 rounded-[var(--radius-lg)] bg-[var(--ds-surface-container-lowest)]" />
                  <div className="h-20 w-24 rounded-[var(--radius-lg)] bg-[var(--ds-surface-container-lowest)]" />
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MastheadActions({
  primaryLabel,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
}: {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}) {
  return (
    <>
      <Button onClick={onPrimaryClick}>{primaryLabel}</Button>
      {secondaryLabel ? (
        <Button variant="secondary" onClick={onSecondaryClick}>
          {secondaryLabel}
        </Button>
      ) : null}
    </>
  );
}
