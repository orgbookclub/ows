import { Book } from '../../books/schemas/book.schema';
import { User } from '../../users/schemas/user.schema';
import { DateRange } from './dateRange';
import { EventStatus } from './event-status';
import { EventType } from './event-type';
import { Participant } from './participant';

export class EventDto {
  name: string;
  book: Book;
  status: keyof typeof EventStatus;
  type: keyof typeof EventType;
  dates: DateRange;
  requestedBy: User;
  interested: User[];
  readers: Participant[];
  leaders: Participant[];
  notes: string;
}
