import { EventStatus } from "./event-status";
import { EventType } from "./event-type";

/**
 * Dto object which is used to filter for a set of events.
 */
export class EventFilter {
  name?: string;
  bookSearchQuery?: string;
  bookIds?: string[];
  threads?: string[];
  status?: EventStatus;
  type?: EventType;
  startDateBefore?: Date;
  startDateAfter?: Date;
  endDateBefore?: Date;
  endDateAfter?: Date;
  participantIds?: string[];
  requestedByIds?: string[];
  interestedIds?: string[];
  readerIds?: string[];
  leaderIds?: string[];
}
