import { DateRange } from './dateRange';
import { EventStatus } from './event-status';
import { EventType } from './event-type';

export class EventDto {
  name: string;
  book: string;
  status: keyof typeof EventStatus;
  type: keyof typeof EventType;
  dates: DateRange;
  requestedBy: string;
  interested: string[];
  readers: string[];
  leaders: string[];
  description: string;
}
