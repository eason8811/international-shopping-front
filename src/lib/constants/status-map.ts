export interface StatusMeta {
    label: string;
}

export const ORDER_STATUS = [
    "CREATED",
    "PENDING_PAYMENT",
    "PAID",
    "CANCELLED",
    "CLOSED",
    "FULFILLED",
    "REFUNDING",
    "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export const PAY_STATUS = ["NONE", "INIT", "PENDING", "SUCCESS", "FAIL", "CLOSED", "EXCEPTION"] as const;

export type PayStatus = (typeof PAY_STATUS)[number];

export const REFUND_STATUS = ["INIT", "PENDING", "SUCCESS", "FAIL", "CLOSED", "EXCEPTION"] as const;

export type RefundStatus = (typeof REFUND_STATUS)[number];

export const SHIPMENT_STATUS = [
    "CREATED",
    "LABEL_CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "CUSTOMS_PROCESSING",
    "CUSTOMS_HOLD",
    "CUSTOMS_RELEASED",
    "HANDED_OVER",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "EXCEPTION",
    "RETURNED",
    "CANCELLED",
    "LOST",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUS)[number];

export const CS_TICKET_STATUS = [
    "OPEN",
    "IN_PROGRESS",
    "AWAITING_USER",
    "AWAITING_CARRIER",
    "ON_HOLD",
    "RESOLVED",
    "REJECTED",
    "CLOSED",
] as const;

export type CsTicketStatus = (typeof CS_TICKET_STATUS)[number];

export const AFTER_SALES_RESHIP_STATUS = ["INIT", "APPROVED", "FULFILLING", "FULFILLED", "CANCELLED"] as const;

export type AfterSalesReshipStatus = (typeof AFTER_SALES_RESHIP_STATUS)[number];

export const ORDER_STATUS_MAP: Record<OrderStatus, StatusMeta> = {
    CREATED: {label: "Created"},
    PENDING_PAYMENT: {label: "Pending Payment"},
    PAID: {label: "Paid"},
    CANCELLED: {label: "Cancelled"},
    CLOSED: {label: "Closed"},
    FULFILLED: {label: "Fulfilled"},
    REFUNDING: {label: "Refunding"},
    REFUNDED: {label: "Refunded"},
};

export const PAY_STATUS_MAP: Record<PayStatus, StatusMeta> = {
    NONE: {label: "None"},
    INIT: {label: "Init"},
    PENDING: {label: "Pending"},
    SUCCESS: {label: "Success"},
    FAIL: {label: "Fail"},
    CLOSED: {label: "Closed"},
    EXCEPTION: {label: "Exception"},
};

export const REFUND_STATUS_MAP: Record<RefundStatus, StatusMeta> = {
    INIT: {label: "Init"},
    PENDING: {label: "Pending"},
    SUCCESS: {label: "Success"},
    FAIL: {label: "Fail"},
    CLOSED: {label: "Closed"},
    EXCEPTION: {label: "Exception"},
};

export const SHIPMENT_STATUS_MAP: Record<ShipmentStatus, StatusMeta> = {
    CREATED: {label: "Created"},
    LABEL_CREATED: {label: "Label Created"},
    PICKED_UP: {label: "Picked Up"},
    IN_TRANSIT: {label: "In Transit"},
    CUSTOMS_PROCESSING: {label: "Customs Processing"},
    CUSTOMS_HOLD: {label: "Customs Hold"},
    CUSTOMS_RELEASED: {label: "Customs Released"},
    HANDED_OVER: {label: "Handed Over"},
    OUT_FOR_DELIVERY: {label: "Out For Delivery"},
    DELIVERED: {label: "Delivered"},
    EXCEPTION: {label: "Exception"},
    RETURNED: {label: "Returned"},
    CANCELLED: {label: "Cancelled"},
    LOST: {label: "Lost"},
};

export const CS_TICKET_STATUS_MAP: Record<CsTicketStatus, StatusMeta> = {
    OPEN: {label: "Open"},
    IN_PROGRESS: {label: "In Progress"},
    AWAITING_USER: {label: "Awaiting User"},
    AWAITING_CARRIER: {label: "Awaiting Carrier"},
    ON_HOLD: {label: "On Hold"},
    RESOLVED: {label: "Resolved"},
    REJECTED: {label: "Rejected"},
    CLOSED: {label: "Closed"},
};

export const AFTER_SALES_RESHIP_STATUS_MAP: Record<AfterSalesReshipStatus, StatusMeta> = {
    INIT: {label: "Init"},
    APPROVED: {label: "Approved"},
    FULFILLING: {label: "Fulfilling"},
    FULFILLED: {label: "Fulfilled"},
    CANCELLED: {label: "Cancelled"},
};
