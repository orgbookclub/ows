import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { EventStatus } from "../../events/dto/event-status";
import { EventType } from "../../events/dto/event-type";
import { EventsService } from "../../events/events.service";
import { EventFilterV2Dto } from "../../events/v2/dto/event-filter.v2.dto";
import { MAX_PAGE_SIZE } from "../../events/v2/dto/event-pagination.v2.dto";
import { EventSortKey } from "../../events/v2/dto/event-sort.v2.dto";
import {
  parseEventPagination,
  parseEventProjection,
  parseEventSort,
} from "../../events/v2/events.v2.utils";

import { toToolResult } from "./result";

/*
 * IMPORTANT: keep this zod schema in lockstep with the v2 query DTOs
 * (EventFilterV2Dto + EventSortDto + EventProjectionDto + EventPaginationDto).
 * It is intentionally a flat 1:1 mirror so `events_search` is a strict
 * superset of GET /api/v2/events.
 */
const eventsSearchInputSchema = {
  name: z.string().optional(),
  bookSearchQuery: z.string().optional(),
  bookIds: z.array(z.string()).optional(),
  threads: z.array(z.string()).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  type: z.nativeEnum(EventType).optional(),
  startDateBefore: z.string().datetime().optional(),
  startDateAfter: z.string().datetime().optional(),
  endDateBefore: z.string().datetime().optional(),
  endDateAfter: z.string().datetime().optional(),
  participantIds: z.array(z.string()).optional(),
  requestedByIds: z.array(z.string()).optional(),
  interestedIds: z.array(z.string()).optional(),
  readerIds: z.array(z.string()).optional(),
  leaderIds: z.array(z.string()).optional(),
  sortBy: z.nativeEnum(EventSortKey).optional(),
  fields: z.string().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
};

const eventsGetByIdInputSchema = {
  id: z.string().min(1),
};

/**
 * Registers the read-only Events tools on the given MCP server.
 * Tool input schemas mirror the v2 query DTOs so the surface stays a strict
 * superset of the GET /api/v2/events endpoint.
 *
 * @param server The MCP server instance.
 * @param events The EventsService used to satisfy tool calls.
 */
export function registerEventsTools(
  server: McpServer,
  events: EventsService,
): void {
  server.registerTool(
    "events_search",
    {
      title: "Search OWS events",
      description:
        "Search OrgBookClub events. Args mirror GET /api/v2/events: filter " +
        "fields plus optional `sortBy`, `fields` (comma-separated projection; " +
        "prefix entries with `-` to exclude), `page`, and `pageSize`. Returns " +
        "a paginated wrapper { items, total, page, pageSize }. Date filters " +
        `are ISO 8601 strings. Default pageSize is ${MAX_PAGE_SIZE} (the ` +
        "maximum allowed); use `page` to fetch subsequent pages.",
      inputSchema: eventsSearchInputSchema,
    },
    async (args) => {
      const filter: EventFilterV2Dto = {
        name: args.name,
        bookSearchQuery: args.bookSearchQuery,
        bookIds: args.bookIds,
        threads: args.threads,
        status: args.status,
        type: args.type,
        startDateBefore: args.startDateBefore
          ? new Date(args.startDateBefore)
          : undefined,
        startDateAfter: args.startDateAfter
          ? new Date(args.startDateAfter)
          : undefined,
        endDateBefore: args.endDateBefore
          ? new Date(args.endDateBefore)
          : undefined,
        endDateAfter: args.endDateAfter
          ? new Date(args.endDateAfter)
          : undefined,
        participantIds: args.participantIds,
        requestedByIds: args.requestedByIds,
        interestedIds: args.interestedIds,
        readerIds: args.readerIds,
        leaderIds: args.leaderIds,
      };
      const projection = parseEventProjection(args.fields);
      const sort = parseEventSort(args.sortBy);
      const pagination = parseEventPagination(
        args.page,
        args.pageSize ?? MAX_PAGE_SIZE,
      );
      const result = await events.findManyV2(
        filter,
        projection,
        sort,
        pagination,
      );
      return toToolResult(result);
    },
  );

  server.registerTool(
    "events_get_by_id",
    {
      title: "Get an OWS event by ID",
      description:
        "Fetch a single OrgBookClub event by its Mongo object ID. Returns the " +
        "event document as JSON, or null if not found.",
      inputSchema: eventsGetByIdInputSchema,
    },
    async ({ id }) => {
      const result = await events.findOne(id);
      return toToolResult(result);
    },
  );
}
