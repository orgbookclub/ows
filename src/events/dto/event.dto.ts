import { Book } from '../../books/schemas/book.schema';
import { UserDto } from '../../users/dto/user.dto';
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
  // User related
  requestedBy: UserDto;
  interested: UserDto[];
  participators: UserDto[];
  leaders: UserDto[];
  notes: string;
  // Floats?
  readerPoints: number;
  leaderPoints: number;
}
