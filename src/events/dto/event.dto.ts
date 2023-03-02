import { DateRange } from "./date-range.dto";
import { EventStatus } from "./event-status";
import { EventType } from "./event-type";
import { Participant } from "./participant.dto";

/**
 * Dto object which stores info for an event.
 */
export class EventDto {
  /**
   * The name of the event.
   *
   * @example "American Gods"
   */
  name: string;
  /**
   * The object ID of the book document.
   */
  book: string;
  /**
   * A list of channel/thread IDs.
   */
  threads: string[];
  /**
   * The status of the event.
   *
   * @example "Approved"
   */
  status: EventStatus;
  /**
   * The type of the event.
   *
   * @example "BuddyRead"
   */
  type: EventType;
  /**
   * The dates for the event.
   */
  dates: DateRange;
  /**
   * The participant who requested the event.
   */
  requestedBy: Participant;
  /**
   * A list of participants who show interest in the event.
   */
  interested: Participant[];
  /**
   * The participants who read the book in the event duration.
   */
  readers: Participant[];
  /**
   * The participants who lead the discussion for the event.
   */
  leaders: Participant[];
  /**
   * The description of the event.
   */
  description: string;
}
