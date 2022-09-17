import { DateRange } from "./dateRange";
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
  status: keyof typeof EventStatus;
  type: keyof typeof EventType;
  dates: DateRange;
  requestedBy: Participant;
  interested: Participant[];
  readers: Participant[];
  leaders: Participant[];
  description: string;
}
