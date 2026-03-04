/**
 * 状态展示元信息
 */
export interface StatusMeta {
    /** 可直接用于 UI 展示的英文标签（后续可替换为 i18n key） */
    label: string;
}

/**
 * 订单状态枚举值（与后端契约保持一致）
 */
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

/**
 * 订单状态类型
 */
export type OrderStatus = (typeof ORDER_STATUS)[number];

/**
 * 支付状态枚举值
 */
export const PAY_STATUS = ["NONE", "INIT", "PENDING", "SUCCESS", "FAIL", "CLOSED", "EXCEPTION"] as const;

/**
 * 支付状态类型
 */
export type PayStatus = (typeof PAY_STATUS)[number];

/**
 * 退款状态枚举值
 */
export const REFUND_STATUS = ["INIT", "PENDING", "SUCCESS", "FAIL", "CLOSED", "EXCEPTION"] as const;

/**
 * 退款状态类型
 */
export type RefundStatus = (typeof REFUND_STATUS)[number];

/**
 * 物流状态枚举值
 */
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

/**
 * 物流状态类型
 */
export type ShipmentStatus = (typeof SHIPMENT_STATUS)[number];

/**
 * 客服工单状态枚举值
 */
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

/**
 * 客服工单状态类型
 */
export type CsTicketStatus = (typeof CS_TICKET_STATUS)[number];

/**
 * 补发单状态枚举值
 */
export const AFTER_SALES_RESHIP_STATUS = ["INIT", "APPROVED", "FULFILLING", "FULFILLED", "CANCELLED"] as const;

/**
 * 补发单状态类型
 */
export type AfterSalesReshipStatus = (typeof AFTER_SALES_RESHIP_STATUS)[number];

/**
 * 订单状态到展示文案的映射
 */
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

/**
 * 支付状态到展示文案的映射
 */
export const PAY_STATUS_MAP: Record<PayStatus, StatusMeta> = {
    NONE: {label: "None"},
    INIT: {label: "Init"},
    PENDING: {label: "Pending"},
    SUCCESS: {label: "Success"},
    FAIL: {label: "Fail"},
    CLOSED: {label: "Closed"},
    EXCEPTION: {label: "Exception"},
};

/**
 * 退款状态到展示文案的映射
 */
export const REFUND_STATUS_MAP: Record<RefundStatus, StatusMeta> = {
    INIT: {label: "Init"},
    PENDING: {label: "Pending"},
    SUCCESS: {label: "Success"},
    FAIL: {label: "Fail"},
    CLOSED: {label: "Closed"},
    EXCEPTION: {label: "Exception"},
};

/**
 * 物流状态到展示文案的映射
 */
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

/**
 * 客服工单状态到展示文案的映射
 */
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

/**
 * 补发单状态到展示文案的映射
 */
export const AFTER_SALES_RESHIP_STATUS_MAP: Record<AfterSalesReshipStatus, StatusMeta> = {
    INIT: {label: "Init"},
    APPROVED: {label: "Approved"},
    FULFILLING: {label: "Fulfilling"},
    FULFILLED: {label: "Fulfilled"},
    CANCELLED: {label: "Cancelled"},
};
