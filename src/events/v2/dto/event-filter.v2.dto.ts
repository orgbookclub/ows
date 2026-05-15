import { EventStatus } from "../../dto/event-status";
import { EventType } from "../../dto/event-type";

/**
 * Dto object used to filter events on the v2 list endpoint.
 */
export class EventFilterV2Dto {
  /**
   * The name of the event.
   *
   * @example "American Gods"
   */
  name?: string;

  /**
   * The query string which will search among book titles.
   *
   * @example "American"
   */
  bookSearchQuery?: string;

  /**
   * A list of object IDs pointing to book documents.
   */
  bookIds?: string[];

  /**
   * A list of channel/thread IDs.
   */
  threads?: string[];

  /**
   * The status of the event.
   *
   * @example "Approved"
   */
  status?: EventStatus;

  /**
   * The type of the event.
   *
   * @example "BuddyRead"
   */
  type?: EventType;

  /**
   * The start date of the event should be before this date.
   */
  startDateBefore?: Date;

  /**
   * The start date of the event should be after this date.
   */
  startDateAfter?: Date;

  /**
   * The end date of the event should be before this date.
   */
  endDateBefore?: Date;

  /**
   * The end date of the event should be after this date.
   */
  endDateAfter?: Date;

  /**
   * The ID of the participant of the event should be in this list.
   * This covers requestors, interested, readers etc all participants.
   */
  participantIds?: string[];

  /**
   * The ID of the requestor of the event should be in this list.
   */
  requestedByIds?: string[];

  /**
   * The ID of the interested people of the event should be in this list.
   */
  interestedIds?: string[];

  /**
   * The ID of the reader of the event should be in this list.
   */
  readerIds?: string[];

  /**
   * The ID of the leader of the event should be in this list.
   */
  leaderIds?: string[];
}
