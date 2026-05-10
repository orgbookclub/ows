import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { EventFilter } from "../../events/dto/event-filter.dto";
import { EventStatus } from "../../events/dto/event-status";
import { EventType } from "../../events/dto/event-type";
import { EventsService } from "../../events/events.service";

import { toToolResult } from "./result";

/*
 * IMPORTANT: keep this zod schema in lockstep with EventFilter
 * (src/events/dto/event-filter.dto.ts). It is intentionally a 1:1 mirror so
 * `events_search` is a strict superset of GET /api/events.
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
  sortBy: z.string().optional(),
};

const eventsGetByIdInputSchema = {
  id: z.string().min(1),
};

/**
 * Registers the read-only Events tools on the given MCP server.
 * Tool input schemas mirror the existing EventFilter DTO so the surface stays
 * a strict superset of the GET /api/events endpoint.
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
        "Search OrgBookClub events. Filters mirror the GET /api/events query " +
        "parameters (EventFilter). Returns a JSON array of matching event " +
        "documents. Date filters are ISO 8601 strings.",
      inputSchema: eventsSearchInputSchema,
    },
    async (args) => {
      const filter: EventFilter = {
        ...args,
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
      };
      const results = await events.findMany(filter);
      return toToolResult(results);
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
