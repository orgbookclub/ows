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
   * @param {EventRepository} repository The repository which handles all DB operations.
   * @param {BooksService} booksService Service for interacting with @see Book documents in DB.
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
   * @param {CreateEventDto} createEventDto The dto object.
   */
  async create(createEventDto: CreateEventDto) {
    return await this.repository.create(createEventDto);
  }

  /**
   * Creates an event from the book URL and Dto object.
   *
   * @param {string} url A valid GR or SG URL.
   * @param {CreateEventDto} createEventDto The Dto object.
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
   * @param {EventFilter} filter Filter.
   */
  async findMany(filter: EventFilter) {
    const query: FilterQuery<Event> = await this.getFilterQuery(filter);
    return await this.repository.find(query);
  }

  /**
   * Gets the event document with the given ID from the database.
   *
   * @param {string} id The object ID of the document.
   */
  async findOne(id: string) {
    return await this.repository.get(id);
  }

  /**
   * Updates the event with the given ID and Dto in the database.
   *
   * @param {string} id The object ID.
   * @param {UpdateEventDto} updateEventDto The dto object.
   */
  async update(id: string, updateEventDto: UpdateEventDto) {
    return await this.repository.update(id, updateEventDto);
  }

  /**
   * Deletes the event document from the DB.
   *
   * @param {string} id The object ID of the event document to remove.
   */
  async remove(id: string) {
    await this.repository.delete(id);
    return true;
  }

  /**
   * Converts the filter into a MongoDB compatible format.
   *
   * @param {EventFilter} filter The filter from the request.
   * @returns {Promise<FilterQuery<Event>>}  A MongoDB FilterQuery object.
   */
  private async getFilterQuery(
    filter: EventFilter,
  ): Promise<FilterQuery<Event>> {
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
        $lte: new Date(filter.startDateBefore),
        ...query["dates.startDate"],
      });
    filter.startDateAfter &&
      (query["dates.startDate"] = {
        $gte: new Date(filter.startDateAfter),
        ...query["dates.startDate"],
      });
    filter.endDateBefore &&
      (query["dates.endDate"] = {
        $lte: new Date(filter.endDateBefore),
        ...query["dates.endDate"],
      });
    filter.endDateAfter &&
      (query["dates.endDate"] = {
        $gte: new Date(filter.endDateAfter),
        ...query["dates.endDate"],
      });
    filter.requestedByIds &&
      (query["requestedBy.user"] = { $in: filter.requestedByIds });
    filter.interestedIds &&
      (query["interested.users"] = { $in: filter.interestedIds });
    filter.readerIds && (query["readers.user"] = { $in: filter.readerIds });
    filter.leaderIds && (query["leaders.user"] = { $in: filter.leaderIds });
    return query;
  }
}
