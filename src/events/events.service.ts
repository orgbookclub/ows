import { Injectable, Logger } from "@nestjs/common";
import { FilterQuery } from "mongoose";

import { BooksService } from "../books/books.service";
import { BookDocument } from "../books/schemas/book.schema";
import { EventRepository } from "../repositories/event.repository";

import { CreateEventDto } from "./dto/create-event.dto";
import { EventFilter } from "./dto/event-filter.dto";
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
   * @param sortOrder The order in which the results should be sorted.
   * @returns A list of events.
   */
  async findMany(filter: EventFilter) {
    const query: FilterQuery<Event> = await this.getFilterQuery(filter);
    const results = await this.repository.find(query, filter.sortBy);
    return results;
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
