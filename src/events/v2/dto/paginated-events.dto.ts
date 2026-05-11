import { ApiProperty } from "@nestjs/swagger";

import { EventDocument } from "../../schemas/event.schema";

/**
 * Wrapper response for the v2 events list endpoint with page-based pagination metadata.
 */
export class PaginatedEventsDto {
  /**
   * The page of event documents matching the request.
   */
  @ApiProperty({ type: [EventDocument] })
  items: EventDocument[];

  /**
   * The total number of event documents matching the filter, across all pages.
   */
  total: number;

  /**
   * The 1-based page number that was returned.
   */
  page: number;

  /**
   * The page size that was applied.
   */
  pageSize: number;
}
