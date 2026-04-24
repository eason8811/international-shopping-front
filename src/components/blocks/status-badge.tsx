import type * as React from "react";

import {
    AFTER_SALES_RESHIP_STATUS_MAP,
    CS_TICKET_STATUS_MAP,
    ORDER_STATUS_MAP,
    PAY_STATUS_MAP,
    REFUND_STATUS_MAP,
    SHIPMENT_STATUS_MAP,
    type AfterSalesReshipStatus,
    type CsTicketStatus,
    type OrderStatus,
    type PayStatus,
    type RefundStatus,
    type ShipmentStatus,
} from "@/lib/constants/status-map";
import {Badge} from "@/components/ui/badge";

type StatusBadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatusBadgeDomain = "order" | "pay" | "refund" | "shipment" | "support" | "reship";

type DomainStatus = {
    order: OrderStatus;
    pay: PayStatus;
    refund: RefundStatus;
    shipment: ShipmentStatus;
    support: CsTicketStatus;
    reship: AfterSalesReshipStatus;
};

const statusLabels: {
    [Domain in StatusBadgeDomain]: Record<DomainStatus[Domain], {label: string}>;
} = {
    order: ORDER_STATUS_MAP,
    pay: PAY_STATUS_MAP,
    refund: REFUND_STATUS_MAP,
    shipment: SHIPMENT_STATUS_MAP,
    support: CS_TICKET_STATUS_MAP,
    reship: AFTER_SALES_RESHIP_STATUS_MAP,
};

const statusTones: {
    [Domain in StatusBadgeDomain]: Partial<Record<DomainStatus[Domain], StatusBadgeTone>>;
} = {
    order: {
        CREATED: "info",
        PENDING_PAYMENT: "warning",
        PAID: "success",
        CANCELLED: "danger",
        CLOSED: "neutral",
        FULFILLED: "success",
        REFUNDING: "warning",
        REFUNDED: "neutral",
    },
    pay: {
        NONE: "neutral",
        INIT: "info",
        PENDING: "warning",
        SUCCESS: "success",
        FAIL: "danger",
        CLOSED: "neutral",
        EXCEPTION: "danger",
    },
    refund: {
        INIT: "info",
        PENDING: "warning",
        SUCCESS: "success",
        FAIL: "danger",
        CLOSED: "neutral",
        EXCEPTION: "danger",
    },
    shipment: {
        CREATED: "info",
        LABEL_CREATED: "info",
        PICKED_UP: "info",
        IN_TRANSIT: "warning",
        CUSTOMS_PROCESSING: "warning",
        CUSTOMS_HOLD: "danger",
        CUSTOMS_RELEASED: "success",
        HANDED_OVER: "info",
        OUT_FOR_DELIVERY: "warning",
        DELIVERED: "success",
        EXCEPTION: "danger",
        RETURNED: "neutral",
        CANCELLED: "danger",
        LOST: "danger",
    },
    support: {
        OPEN: "info",
        IN_PROGRESS: "warning",
        AWAITING_USER: "warning",
        AWAITING_CARRIER: "warning",
        ON_HOLD: "neutral",
        RESOLVED: "success",
        REJECTED: "danger",
        CLOSED: "neutral",
    },
    reship: {
        INIT: "info",
        APPROVED: "success",
        FULFILLING: "warning",
        FULFILLED: "success",
        CANCELLED: "danger",
    },
};

const badgeVariantByTone = {
    neutral: "secondary",
    success: "success",
    warning: "warning",
    danger: "destructive",
    info: "info",
} as const;

export type StatusBadgeProps<Domain extends StatusBadgeDomain = StatusBadgeDomain> = Omit<
    React.ComponentProps<typeof Badge>,
    "children" | "variant"
> & {
    domain: Domain;
    status: DomainStatus[Domain];
    label?: string;
    tone?: StatusBadgeTone;
};

export function StatusBadge<Domain extends StatusBadgeDomain>({
    domain,
    status,
    label,
    tone,
    ...props
}: StatusBadgeProps<Domain>) {
    const resolvedLabel = label ?? statusLabels[domain][status].label;
    const resolvedTone = tone ?? statusTones[domain][status] ?? "neutral";

    return (
        <Badge variant={badgeVariantByTone[resolvedTone]} {...props}>
            {resolvedLabel}
        </Badge>
    );
}
