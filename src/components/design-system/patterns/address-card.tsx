import type { ReactNode } from "react";

import type { UserAddressView } from "@/entities/user";
import { cn } from "@/lib/utils";

import { Badge, Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../primitives";

export function AddressCard({
  address,
  validationLabel,
  actions,
  defaultLabel = "Default",
  emptyPhoneLabel = "No phone number",
  className,
}: {
  address: UserAddressView;
  validationLabel?: string;
  actions?: ReactNode;
  defaultLabel?: string;
  emptyPhoneLabel?: string;
  className?: string;
}) {
  return (
    <Card variant="base" className={cn(className)}>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{address.receiverName}</CardTitle>
              {address.isDefault ? <Badge tone="defaultAddress">{defaultLabel}</Badge> : null}
              {validationLabel ? <Badge tone="neutral">{validationLabel}</Badge> : null}
            </div>
            <CardDescription>{address.phone.display ?? emptyPhoneLabel}</CardDescription>
          </div>
          {actions ? <CardAction>{actions}</CardAction> : null}
        </div>
      </CardHeader>
      <CardContent className="gap-3 pt-0">
        {address.locationLabel ? (
          <p className="ds-type-body-md text-[var(--ds-on-surface-muted)]">{address.locationLabel}</p>
        ) : null}
        <div className="flex flex-col gap-1.5">
          {address.addressLines.map((line, index) => (
            <p key={`${address.id}-${index}`} className="ds-type-body-lg text-[var(--ds-on-surface)]">
              {line}
            </p>
          ))}
          {address.zipcode ? (
            <p className="ds-type-data-sm text-[var(--ds-on-surface-muted)]">{address.zipcode}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
