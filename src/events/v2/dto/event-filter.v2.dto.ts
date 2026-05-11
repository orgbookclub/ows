import { OmitType } from "@nestjs/swagger";

import { EventFilter } from "../../dto/event-filter.dto";

/**
 * Dto object used to filter events on the v2 list endpoint.
 * Mirrors the v1 EventFilter but excludes sortBy, which lives on EventSortDto.
 */
export class EventFilterV2Dto extends OmitType(EventFilter, [
  "sortBy",
] as const) {}
