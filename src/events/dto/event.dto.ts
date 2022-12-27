import { DateRange } from "./date-range.dto";
import { EventStatus } from "./event-status";
import { EventType } from "./event-type";
import { Participant } from "./participant";

/**
 * Dto object which stores info for an event.
 */
export class EventDto {
  name: string;
  book: string;
  threads: string[];
  status: EventStatus;
  type: EventType;
  dates: DateRange;
  requestedBy: Participant;
  interested: Participant[];
  readers: Participant[];
  leaders: Participant[];
  description: string;
}
