/**
 * Pagination utility for standard RESTful query parameters.
 *
 * Query format:
 *   ?page=1&pageSize=10&status=PUBLISHED&gender=men&date=2025-03-19&sort=createdAt&order=desc
 */

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

/**
 * Parse standard `?page=1&pageSize=10` pagination query params.
 * Enforces sensible defaults and limits.
 */
export function parsePagination(query: {
  page?: string;
  pageSize?: string;
}): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '25', 10) || 25));

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Build pagination meta for the API response.
 */
export function buildPaginationMeta(
  total: number,
  pagination: PaginationParams,
): PaginatedMeta {
  return {
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      pageCount: Math.ceil(total / pagination.pageSize) || 0,
      total,
    },
  };
}
