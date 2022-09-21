import { DateRange } from "./date-range.dto";
import { EventStatus } from "./event-status";
import { EventType } from "./event-type";

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
  requestedBy: string;
  interested: string[];
  readers: string[];
  leaders: string[];
  description: string;
}
