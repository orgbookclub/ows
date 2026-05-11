/**
 * The set of top-level Event fields and nested paths that are valid in a projection.
 */
export const EVENT_PROJECTION_ALLOWLIST: ReadonlySet<string> = new Set([
  "name",
  "book",
  "threads",
  "status",
  "type",
  "dates",
  "dates.startDate",
  "dates.endDate",
  "requestedBy",
  "interested",
  "readers",
  "leaders",
  "description",
]);

/**
 * Dto object describing the field projection for the v2 events list endpoint.
 */
export class EventProjectionDto {
  /**
   * Comma-separated list of fields to include in the response, or to exclude
   * when each entry is prefixed with `-`. Inclusion and exclusion cannot be
   * mixed in a single request. The `_id` field is always returned regardless.
   *
   * @example "name,status,dates.startDate"
   */
  fields?: string;
}
