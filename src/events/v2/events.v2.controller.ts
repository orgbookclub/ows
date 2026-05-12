import { Controller, Get, Logger, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { Scopes } from "../../auth/scopes.decorator";
import { EventsService } from "../events.service";

import { EventFilterV2Dto } from "./dto/event-filter.v2.dto";
import { EventPaginationDto } from "./dto/event-pagination.v2.dto";
import { EventProjectionDto } from "./dto/event-projection.v2.dto";
import { EventSortDto } from "./dto/event-sort.v2.dto";
import { PaginatedEventsDto } from "./dto/paginated-events.dto";
import {
  parseEventPagination,
  parseEventProjection,
  parseEventSort,
} from "./events.v2.utils";

/**
 * The Events v2 controller.
 * Exposes a paginated list endpoint with projection and sort as orthogonal
 * query-string concerns.
 */
@ApiTags("Events")
@Controller("api/v2/events")
@ApiBearerAuth()
export class EventsV2Controller {
  /**
   * Initializes an instance of EventsV2Controller.
   *
   * @param eventsService The events service.
   */
  constructor(private readonly eventsService: EventsService) {
    Logger.debug("Initialized EventsV2Controller");
  }

  /**
   * Gets a paginated slice of event documents matching the filter, with optional
   * projection and sort.
   *
   * @param filter The v2 filter.
   * @param projection The projection.
   * @param sort The sort.
   * @param pagination The pagination.
   * @returns A paginated wrapper around the matching event documents.
   */
  @Get()
  @Scopes("events:read")
  @ApiOkResponse({ type: PaginatedEventsDto })
  async find(
    @Query() filter: EventFilterV2Dto,
    @Query() projection: EventProjectionDto,
    @Query() sort: EventSortDto,
    @Query() pagination: EventPaginationDto,
  ): Promise<PaginatedEventsDto> {
    const parsedProjection = parseEventProjection(projection.fields);
    const parsedSort = parseEventSort(sort.sortBy);
    const parsedPagination = parseEventPagination(
      pagination.page,
      pagination.pageSize,
    );
    return await this.eventsService.findManyV2(
      filter,
      parsedProjection,
      parsedSort,
      parsedPagination,
    );
  }
}
