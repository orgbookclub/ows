import { DateRange } from '../events/dto/dateRange';
import { EventStatus } from '../events/dto/event-status';
import { EventType } from '../events/dto/event-type';
import { EventDto } from '../events/dto/event.dto';
import { Event } from '../events/schemas/event.schema';
import { mockBookDocs } from './mockBookValues';
import { mockUserDocs } from './mockUserValues';

const mockDateRange = (
  startDate = new Date('2022-01-01'),
  endDate = new Date('2022-02-01'),
): DateRange => ({
  startDate: startDate,
  endDate: endDate,
});

export const mockEvent = (
  name = 'mockEvent',
  book = mockBookDocs[0]._id,
  status = EventStatus.Requested,
  type = EventType.BuddyRead,
  dates = mockDateRange(),
  requestedBy = mockUserDocs[0]._id,
  interested = [mockUserDocs[0]._id, mockUserDocs[1]._id],
  readers = [],
  leaders = [mockUserDocs[0]._id],
  description = 'mock event description',
): EventDto => ({
  name: name,
  book: book,
  status: status,
  type: type,
  dates: dates,
  requestedBy: requestedBy,
  interested: interested,
  readers: readers,
  leaders: leaders,
  description: description,
});

export const mockEvents: EventDto[] = [
  mockEvent(),
  mockEvent('mockEvent#2'),
  mockEvent('mockEvent#3'),
];

export const mockEventDocs: Event[] = [
  {
    book: mockBookDocs[0],
    requestedBy: [mockUserDocs[0]],
    interested: [mockUserDocs[0], mockUserDocs[1]],
    leaders: [mockUserDocs[0]],
    ...mockEvent[0],
  },
  {
    book: mockBookDocs[0],
    requestedBy: [mockUserDocs[0]],
    interested: [mockUserDocs[0], mockUserDocs[1]],
    leaders: [mockUserDocs[0]],
    ...mockEvent[0],
  },
  {
    book: mockBookDocs[0],
    requestedBy: [mockUserDocs[0]],
    interested: [mockUserDocs[0], mockUserDocs[1]],
    leaders: [mockUserDocs[0]],
    ...mockEvent[0],
  },
];
