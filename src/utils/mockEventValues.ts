import { BookDto } from "../books/dto/book.dto";
import { DateRange } from "../events/dto/date-range.dto";
import { EventStatus } from "../events/dto/event-status";
import { EventType } from "../events/dto/event-type";
import { EventDto } from "../events/dto/event.dto";
import { Participant } from "../events/dto/participant.dto";

import { mockBookDocs } from "./mockBookValues";
import { mockUserDocs } from "./mockUserValues";

const mockDateRange = (
  startDate = new Date("2022-01-01"),
  endDate = new Date("2022-02-01"),
): DateRange => ({
  startDate: startDate,
  endDate: endDate,
});

const mockParticipant = (user): Participant => ({
  user: user._id,
  points: 0,
});

/**
 * Creates a mock EventDto object.
 *
 * @param name Name of the event.
 * @param book The book.
 * @param status The status of the event.
 * @param type The event type.
 * @param dates Dates of the event.
 * @param requestedBy User Id of the requester.
 * @param interested List of user IDs of interested users.
 * @param readers List of user IDs.
 * @param leaders List of user IDs.
 * @param description The description of the event.
 * @param threads The thread Ids for the event.
 * @returns EventDto object.
 */
export const mockEvent = (
  name = "mockEvent",
  book = mockBookDocs[0]._id,
  status = EventStatus.Requested,
  type = EventType.BuddyRead,
  dates = mockDateRange(),
  requestedBy = mockParticipant(mockUserDocs[0]),
  interested = [
    mockParticipant(mockUserDocs[0]),
    mockParticipant(mockUserDocs[1]),
  ],
  readers = [],
  leaders = [mockParticipant(mockUserDocs[0])],
  description = "mock event description",
  threads = [],
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
  threads: threads,
});

export const mockEvents: EventDto[] = [
  mockEvent(),
  mockEvent("mockEvent#2"),
  mockEvent("mockEvent#3"),
];

export const mockEventDocs = [
  {
    _id: "mockId#1",
    book: mockBookDocs[0],
    requestedBy: [mockParticipant(mockUserDocs[0])],
    interested: [
      mockParticipant(mockUserDocs[0]),
      mockParticipant(mockUserDocs[1]),
    ],
    leaders: [mockParticipant(mockUserDocs[0])],
    ...mockEvent[0],
  },
  {
    _id: "mockId#2",
    book: mockBookDocs[0],
    requestedBy: [mockParticipant(mockUserDocs[0])],
    interested: [
      mockParticipant(mockUserDocs[0]),
      mockParticipant(mockUserDocs[1]),
    ],
    leaders: [mockParticipant(mockUserDocs[0])],
    ...mockEvent[0],
  },
  {
    _id: "mockId#3",
    book: mockBookDocs[0],
    requestedBy: [mockParticipant(mockUserDocs[0])],
    interested: [
      mockParticipant(mockUserDocs[0]),
      mockParticipant(mockUserDocs[1]),
    ],
    leaders: [mockParticipant(mockUserDocs[0])],
    ...mockEvent[0],
  },
];
