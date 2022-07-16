import { Book } from '../../books/schemas/book.schema';
import { User } from '../../users/schemas/user.schema';
import { EventStatus } from './event-status';
import { EventType } from './event-type';

export class DateRange {
  startDate: Date;
  endDate: Date;
}

export class EventDto {
  id: string;
  name: string;
  book: Book;
  status: keyof typeof EventStatus;
  type: keyof typeof EventType;
  dates: DateRange;
  requestedBy: User;
  interested: User[];
  participators: User[];
  leaders: User[];
  notes: string;
  readerPoints: number;
  leaderPoints: number;
}
