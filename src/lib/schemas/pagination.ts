export interface OffsetPaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface CursorPaginationMeta {
    limit: number;
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
}

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
