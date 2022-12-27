import { BookDto } from "../books/dto/book.dto";
import { DateRange } from "../events/dto/date-range.dto";
import { EventStatus } from "../events/dto/event-status";
import { EventType } from "../events/dto/event-type";
import { EventDto } from "../events/dto/event.dto";
import { Participant } from "../events/dto/participant";

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
 * @param {string} name Name of the event.
 * @param {BookDto} book The book.
 * @param {EventStatus} status The status of the event.
 * @param {EventType} type The event type.
 * @param {DateRange} dates Dates of the event.
 * @param {Participant} requestedBy User Id of the requester.
 * @param {Participant[]} interested List of user IDs of interested users.
 * @param {Participant[]} readers List of user IDs.
 * @param {Participant[]} leaders List of user IDs.
 * @param {string} description The description of the event.
 * @param {string[]} threads The thread Ids for the event.
 * @returns {EventDto} EventDto object.
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
