import type { ReactNode } from "react";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "../primitives";

export function OrderSummaryCard({
  eyebrow,
  title,
  status,
  amount,
  itemSummary,
  timeline,
  action,
  amountLabel = "Amount",
  timelineLabel = "Next step",
}: {
  eyebrow: string;
  title: string;
  status: string;
  amount: string;
  itemSummary: string;
  timeline: string;
  action?: ReactNode;
  amountLabel?: string;
  timelineLabel?: string;
}) {
  return (
    <Card variant="base">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{eyebrow}</Badge>
          <Badge tone="warning">{status}</Badge>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{itemSummary}</CardDescription>
      </CardHeader>
      <CardContent className="gap-4 pt-0">
        <div className="rounded-[var(--radius-lg)] bg-[var(--ds-surface-container-low)] px-4 py-3">
          <p className="ds-type-data-sm text-[var(--ds-on-surface-muted)] uppercase tracking-[0.16em]">{amountLabel}</p>
          <p className="mt-1 ds-type-title-lg text-[var(--ds-on-surface-strong)]">{amount}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-[var(--ds-surface-container)] px-4 py-3">
          <p className="ds-type-data-sm text-[var(--ds-on-surface-muted)] uppercase tracking-[0.16em]">{timelineLabel}</p>
          <p className="mt-1 ds-type-body-md text-[var(--ds-on-surface)]">{timeline}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
