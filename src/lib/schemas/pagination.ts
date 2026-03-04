/**
 * 偏移量分页元信息
 */
export interface OffsetPaginationMeta {
    /** 当前页（从 1 开始） */
    page: number;
    /** 每页条数 */
    pageSize: number;
    /** 总记录数 */
    total: number;
    /** 总页数 */
    totalPages: number;
    /** 是否存在下一页 */
    hasNext: boolean;
    /** 是否存在上一页 */
    hasPrev: boolean;
}

/**
 * 游标分页元信息
 */
export interface CursorPaginationMeta {
    /** 单次请求条数上限 */
    limit: number;
    /** 下一页游标，没有则为 `null` */
    nextCursor: string | null;
    /** 上一页游标，没有则为 `null` */
    prevCursor: string | null;
    /** 是否还有更多数据 */
    hasMore: boolean;
}

/**
 * 规范化偏移量分页数据，补齐派生字段并处理非法值
 *
 * @param value 至少包含 `page/pageSize/total` 的分页数据
 * @returns 完整且安全的分页元信息
 */
export function normalizeOffsetPagination(
    value: Partial<OffsetPaginationMeta> & Pick<OffsetPaginationMeta, "page" | "pageSize" | "total">,
): OffsetPaginationMeta {
    const page = Math.max(1, Math.trunc(value.page));
    const pageSize = Math.max(1, Math.trunc(value.pageSize));
    const total = Math.max(0, Math.trunc(value.total));
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
