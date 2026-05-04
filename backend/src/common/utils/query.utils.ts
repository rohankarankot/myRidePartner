export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PaginatedMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export function parsePagination(query: {
  page?: string;
  pageSize?: string;
}): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '25', 10) || 25));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPaginationMeta(total: number, pagination: PaginationParams): PaginatedMeta {
  return {
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      pageCount: Math.ceil(total / pagination.pageSize) || 0,
      total,
    },
  };
}
