import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { FilterQuery } from "mongoose";

import { BooksService } from "../books/books.service";
import { BookDocument } from "../books/schemas/book.schema";
import { EventRepository } from "../repositories/event.repository";

import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilter } from "./dto/event-filter.dto";
import { EventStatus } from "./dto/event-status";
import { EventType } from "./dto/event-type";
import { UpdateEventDto } from "./dto/update-event.dto";
import { Event } from "./schemas/event.schema";

/**
 * The Events Service.
 */
@Injectable()
export class EventsService {
  /**
   * Initializes an instance of EventsService.
   *
   * @param repository The repository which handles all DB operations.
   * @param booksService Service for interacting with @see Book documents in DB.
   */
  constructor(
    private repository: EventRepository,
    private readonly booksService: BooksService,
  ) {
    Logger.debug("Initialized EventsService");
  }

  /**
   * Creates an event from the Dto object.
   *
   * @param createEventDto The dto object.
   * @returns The created event.
   */
  async create(createEventDto: CreateEventDto) {
    return await this.repository.create(createEventDto);
  }

  /**
   * Creates an event from the book URL and Dto object.
   *
   * @param url A valid GR or SG URL.
   * @param createEventDto The Dto object.
   * @returns The created event.
   */
  async createFromUrl(url: string, createEventDto: CreateEventDto) {
    let book: BookDocument;
    book = await this.booksService.findBookByUrl(url);
    if (book === null) book = await this.booksService.createBookFromUrl(url);
    createEventDto.book = book._id;
    return await this.repository.create(createEventDto);
  }

  /**
   * Gets all event documents from the database which satisfy the filter conditions.
   *
   * @param filter Filter.
   * @returns A list of events.
   */
  async findMany(filter: EventFilter) {
    const query: FilterQuery<Event> = await this.getFilterQuery(filter);
    return await this.repository.find(query);
  }

  /**
   * Gets the event document with the given ID from the database.
   *
   * @param id The object ID of the document.
   * @returns The event.
   */
  async findOne(id: string) {
    return await this.repository.get(id);
  }

  /**
   * Updates the event with the given ID and Dto in the database.
   *
   * @param id The object ID.
   * @param updateEventDto The dto object.
   * @returns The updated event.
   */
  async update(id: string, updateEventDto: UpdateEventDto) {
    return await this.repository.update(id, updateEventDto);
  }

  /**
   * Deletes the event document from the DB.
   *
   * @param id The object ID of the event document to remove.
   * @returns True if the delete operation has succeeded.
   */
  async remove(id: string) {
    await this.repository.delete(id);
    return true;
  }

  /**
   * Approves requested BRs which start within a period of 10 days from now,
   * and have reached the minimum participant count.
   *
   * @param minParticipantCount The minimum participant count.
   */
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async approveValidRequestedBRs(minParticipantCount = 10) {
    try {
      const now = new Date(Date.now());
      const nowPlus10Days = new Date(Date.now() + 10 * 24 * 3600 * 1000);

      const requestedEventsQuery: FilterQuery<Event> = {
        status: EventStatus.Requested,
        type: EventType.BuddyRead,
        "dates.startDate": {
          $gte: now.toISOString(),
          $lte: nowPlus10Days.toISOString(),
        },
        interested: { $exists: true },
        leaders: { $exists: true },
      };
      const requestedBRs = await this.repository.find(requestedEventsQuery);
      Logger.debug(
        `Found ${requestedBRs.length} potential valid BRs to approve`,
      );

      requestedBRs.forEach(async (eventDoc) => {
        if (
          eventDoc.interested.length >= minParticipantCount &&
          eventDoc.leaders.length > 0
        ) {
          Logger.log(`Approving event request ${eventDoc.id}`);
          await this.repository.update(eventDoc.id, {
            status: EventStatus.Approved,
          });
        }
      });
    } catch (error) {
      Logger.error(`${this.approveValidRequestedBRs.name} job failed!`);
    }
  }

  /**
   * Rejects requested BRs whose start date has passed,
   * and have not reached the minimum participant count.
   *
   * @param minParticipantCount The minimum participant count.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async rejectInvalidRequestedBRs(minParticipantCount = 10) {
    try {
      const now = new Date(Date.now());
      const requestedEventsQuery: FilterQuery<Event> = {
        status: EventStatus.Requested,
        type: EventType.BuddyRead,
        "dates.startDate": { $lte: now.toISOString() },
        interested: { $exists: true },
        leaders: { $exists: true },
      };

      const requestedBRs = await this.repository.find(requestedEventsQuery);
      Logger.debug(
        `Found ${requestedBRs.length} potential invalid BRs to reject`,
      );

      requestedBRs.forEach(async (eventDoc) => {
        if (
          eventDoc.interested.length < minParticipantCount ||
          eventDoc.leaders.length === 0
        ) {
          Logger.log(`Rejecting event request ${eventDoc.id}`);
          await this.repository.update(eventDoc.id, {
            status: EventStatus.Rejected,
          });
        }
      });
    } catch (error) {
      Logger.error(`${this.rejectInvalidRequestedBRs.name} job failed!`);
    }
  }

  /**
   * Changes states of announced events to Ongoing if the start date has passed, and end date is yet to come.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async startAnnouncedEvents() {
    try {
      const now = new Date(Date.now());
      const announcedEventsQuery: FilterQuery<Event> = {
        status: EventStatus.Announced,
        $and: [
          { "dates.startDate": { $lte: now.toISOString() } },
          { "dates.endDate": { $gte: now.toISOString() } },
        ],
      };
      const announcedEvents = await this.repository.find(announcedEventsQuery);
      announcedEvents.forEach(async (eventDoc) => {
        Logger.log(`Starting event ${eventDoc.id}`);
        await this.repository.update(eventDoc.id, {
          status: EventStatus.Ongoing,
        });
      });
    } catch (error) {
      Logger.error(`${this.startAnnouncedEvents.name} job failed`);
    }
  }

  /**
   * Changes states of ongoing events to ended if the end date has passed at least 2 days ago.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async endOngoingEvents() {
    try {
      const nowMinus2Days = new Date(Date.now() - 2 * 24 * 3600 * 1000);
      const announcedEventsQuery: FilterQuery<Event> = {
        status: EventStatus.Ongoing,
        $and: [{ "dates.endDate": { $lte: nowMinus2Days.toISOString() } }],
      };
      const announcedEvents = await this.repository.find(announcedEventsQuery);
      announcedEvents.forEach(async (eventDoc) => {
        Logger.log(`Ending event ${eventDoc.id}`);
        await this.repository.update(eventDoc.id, {
          status: EventStatus.Completed,
        });
      });
    } catch (error) {
      Logger.error(`${this.endOngoingEvents.name} job failed`);
    }
  }

  /**
   * Converts the filter into a MongoDB compatible format.
   *
   * @param filter The filter from the request.
   * @returns  A MongoDB FilterQuery object.
   */
  private async getFilterQuery(filter: EventFilter) {
    const query: FilterQuery<Event> = {};
    filter.name && (query.name = filter.name);
    if (filter.bookSearchQuery) {
      const books = await this.booksService.findBooks(filter.bookSearchQuery);
      if (books.length > 0) {
        if (!filter.bookIds) {
          filter.bookIds = [];
        }
        books.forEach((book) => filter.bookIds.push(book._id.toString()));
      }
    }
    filter.bookIds && (query.book = { $in: filter.bookIds });
    filter.threads && (query.threads = { $in: filter.threads });
    filter.status && (query.status = filter.status);
    filter.type && (query.type = filter.type);
    filter.startDateBefore &&
      (query["dates.startDate"] = {
        $lte: new Date(filter.startDateBefore).toISOString(),
        ...query["dates.startDate"],
      });
    filter.startDateAfter &&
      (query["dates.startDate"] = {
        $gte: new Date(filter.startDateAfter).toISOString(),
        ...query["dates.startDate"],
      });
    filter.endDateBefore &&
      (query["dates.endDate"] = {
        $lte: new Date(filter.endDateBefore).toISOString(),
        ...query["dates.endDate"],
      });
    filter.endDateAfter &&
      (query["dates.endDate"] = {
        $gte: new Date(filter.endDateAfter).toISOString(),
        ...query["dates.endDate"],
      });
    filter.participantIds &&
      (query["$or"] = [
        { "requestedBy.user": { $in: filter.participantIds } },
        { "interested.user": { $in: filter.participantIds } },
        { "readers.user": { $in: filter.participantIds } },
        { "leaders.user": { $in: filter.participantIds } },
      ]);
    filter.requestedByIds &&
      (query["requestedBy.user"] = { $in: filter.requestedByIds });
    filter.interestedIds &&
      (query["interested.user"] = { $in: filter.interestedIds });
    filter.readerIds && (query["readers.user"] = { $in: filter.readerIds });
    filter.leaderIds && (query["leaders.user"] = { $in: filter.leaderIds });
    return query;
  }
}
