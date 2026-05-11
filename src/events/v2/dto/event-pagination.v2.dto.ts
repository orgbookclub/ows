/**
 * Default page when none is supplied.
 */
export const DEFAULT_PAGE = 1;

/**
 * Default page size when none is supplied.
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum allowed page size.
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Dto object describing page-based pagination for the v2 events list endpoint.
 */
export class EventPaginationDto {
  /**
   * The 1-based page number to return.
   *
   * @example 1
   */
  page?: number;

  /**
   * The maximum number of items to return per page.
   *
   * @example 20
   */
  pageSize?: number;
}
