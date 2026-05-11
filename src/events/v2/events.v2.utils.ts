import { BadRequestException } from "@nestjs/common";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "./dto/event-pagination.v2.dto";
import { EVENT_PROJECTION_ALLOWLIST } from "./dto/event-projection.v2.dto";
import { EventSortKey } from "./dto/event-sort.v2.dto";

/**
 * The mode of a parsed projection.
 */
type ProjectionMode = "include" | "exclude" | "none";

/**
 * The structured result of parsing the projection query string.
 */
interface ParsedProjection {
  /**
   * String suitable for mongoose's `.select()`. `undefined` when no projection was requested.
   */
  selectString?: string;
  /**
   * Whether the projection is inclusion-mode, exclusion-mode, or absent.
   */
  mode: ProjectionMode;
  /**
   * The set of top-level field names referenced in the projection.
   * For inclusion mode this is the set of fields the client wants returned.
   * For exclusion mode this is the set of fields the client wants dropped.
   */
  topLevelFields: Set<string>;
}

/**
 * The result of parsing the pagination query string.
 */
interface ParsedPagination {
  /**
   * The 1-based page number, defaulted when the client did not supply one.
   */
  page: number;
  /**
   * The page size, defaulted when the client did not supply one.
   */
  pageSize: number;
}

/**
 * Parses an unknown query value as a positive integer, applying a default when absent.
 *
 * @param input The raw value.
 * @param name The parameter name, used in the error message.
 * @param fallback The default value to use when input is omitted.
 * @returns The parsed integer.
 */
function parsePositiveInt(
  input: unknown,
  name: string,
  fallback: number,
): number {
  if (input === undefined || input === null || input === "") return fallback;
  const raw = typeof input === "number" ? input.toString() : String(input);
  if (!/^\d+$/.test(raw)) {
    throw new BadRequestException(`'${name}' must be a positive integer.`);
  }
  const parsed = parseInt(raw, 10);
  if (parsed < 1) {
    throw new BadRequestException(`'${name}' must be at least 1.`);
  }
  return parsed;
}

/**
 * Parses and validates the `fields` projection query parameter.
 *
 * @param input The raw value of the `fields` query parameter.
 * @returns A structured ParsedProjection describing the request.
 */
function parseEventProjection(input?: unknown): ParsedProjection {
  if (input === undefined || input === null || input === "") {
    return { mode: "none", topLevelFields: new Set() };
  }
  if (typeof input !== "string") {
    throw new BadRequestException("'fields' must be a comma-separated string.");
  }

  const rawEntries = input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (rawEntries.length === 0) {
    return { mode: "none", topLevelFields: new Set() };
  }

  const hasInclude = rawEntries.some((e) => !e.startsWith("-"));
  const hasExclude = rawEntries.some((e) => e.startsWith("-"));
  if (hasInclude && hasExclude) {
    throw new BadRequestException(
      "'fields' cannot mix inclusion and exclusion entries in the same request.",
    );
  }

  const mode: ProjectionMode = hasExclude ? "exclude" : "include";
  const cleaned: string[] = [];
  const topLevelFields = new Set<string>();
  for (const entry of rawEntries) {
    const path = entry.startsWith("-") ? entry.slice(1) : entry;
    if (path.length === 0) {
      throw new BadRequestException("'fields' contains an empty entry.");
    }
    if (!EVENT_PROJECTION_ALLOWLIST.has(path)) {
      throw new BadRequestException(
        `'fields' contains an unknown event field: '${path}'.`,
      );
    }
    if (cleaned.includes(entry)) continue;
    cleaned.push(entry);
    topLevelFields.add(path.split(".")[0]);
  }

  return {
    selectString: cleaned.join(" "),
    mode,
    topLevelFields,
  };
}

/**
 * Parses and validates the `sortBy` query parameter.
 *
 * @param input The raw value of the `sortBy` query parameter.
 * @returns The validated EventSortKey, or undefined when no sort was requested.
 */
function parseEventSort(input?: unknown): EventSortKey | undefined {
  if (input === undefined || input === null || input === "") return undefined;
  if (typeof input !== "string") {
    throw new BadRequestException("'sortBy' must be a string.");
  }
  const allowed = Object.values(EventSortKey) as string[];
  if (!allowed.includes(input)) {
    throw new BadRequestException(
      `'sortBy' must be one of: ${allowed.join(", ")}.`,
    );
  }
  return input as EventSortKey;
}

/**
 * Parses and validates the `page` and `pageSize` pagination query parameters.
 *
 * @param pageInput The raw value of the `page` query parameter.
 * @param pageSizeInput The raw value of the `pageSize` query parameter.
 * @returns The validated pagination, with defaults applied where omitted.
 */
function parseEventPagination(
  pageInput?: unknown,
  pageSizeInput?: unknown,
): ParsedPagination {
  const page = parsePositiveInt(pageInput, "page", DEFAULT_PAGE);
  const pageSize = parsePositiveInt(
    pageSizeInput,
    "pageSize",
    DEFAULT_PAGE_SIZE,
  );
  if (pageSize > MAX_PAGE_SIZE) {
    throw new BadRequestException(`'pageSize' cannot exceed ${MAX_PAGE_SIZE}.`);
  }
  return { page, pageSize };
}

export {
  ParsedPagination,
  ParsedProjection,
  ProjectionMode,
  parseEventPagination,
  parseEventProjection,
  parseEventSort,
};
