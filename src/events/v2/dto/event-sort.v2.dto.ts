// eslint-disable-next-line no-shadow
export enum EventSortKey {
  StartDateAsc = "startDateAsc",
  StartDateDesc = "startDateDesc",
  EndDateAsc = "endDateAsc",
  EndDateDesc = "endDateDesc",
}

/**
 * Dto object describing the sort parameters for the v2 events list endpoint.
 */
export class EventSortDto {
  /**
   * The criterion to sort the events by.
   * Defaults to startDateDesc when omitted.
   *
   * @example "startDateDesc"
   */
  sortBy?: EventSortKey;
}
