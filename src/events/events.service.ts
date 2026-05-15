import { Injectable, Logger } from "@nestjs/common";
import { FilterQuery } from "mongoose";

import { BooksService } from "../books/books.service";
import { BookDocument } from "../books/schemas/book.schema";
import {
  EventRepository,
  planEventPopulates,
} from "../repositories/event.repository";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { Event } from "./schemas/event.schema";
import { EventFilterV2Dto } from "./v2/dto/event-filter.v2.dto";
import { EventSortKey } from "./v2/dto/event-sort.v2.dto";
import { PaginatedEventsDto } from "./v2/dto/paginated-events.dto";
import { ParsedPagination, ParsedProjection } from "./v2/events.v2.utils";

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
   * Gets a paginated, optionally projected and sorted, slice of event documents.
   *
   * @param filter The v2 filter (no sortBy).
   * @param projection The parsed projection plan.
   * @param sort The validated sort key, or undefined for the repository default.
   * @param pagination The validated pagination.
   * @returns A paginated wrapper around the matching event documents.
   */
  async findManyV2(
    filter: EventFilterV2Dto,
    projection: ParsedProjection,
    sort: EventSortKey | undefined,
    pagination: ParsedPagination,
  ): Promise<PaginatedEventsDto> {
    const query: FilterQuery<Event> = await this.getFilterQuery(filter);
    const populatePaths = planEventPopulates(
      projection.mode,
      projection.topLevelFields,
    );
    const { items, total } = await this.repository.findPaginated(
      query,
      sort,
      projection.selectString,
      populatePaths,
      pagination.page,
      pagination.pageSize,
    );
    return {
      items,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
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
  private async getFilterQuery(filter: EventFilterV2Dto) {
    const query: FilterQuery<Event> = {};
    if (filter.name) {
      query.name = filter.name;
    }
    if (filter.bookSearchQuery) {
      const books = await this.booksService.findBooks(filter.bookSearchQuery);
      if (books.length > 0) {
        if (!filter.bookIds) {
          filter.bookIds = [];
        }
        books.forEach((book) => filter.bookIds.push(book._id.toString()));
      }
    }
    if (filter.bookIds) {
      query.book = { $in: filter.bookIds };
    }
    if (filter.threads) {
      query.threads = { $in: filter.threads };
    }
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.type) {
      query.type = filter.type;
    }
    if (filter.startDateBefore) {
      query["dates.startDate"] = {
        $lte: new Date(filter.startDateBefore).toISOString(),
        ...query["dates.startDate"],
      };
    }
    if (filter.startDateAfter) {
      query["dates.startDate"] = {
        $gte: new Date(filter.startDateAfter).toISOString(),
        ...query["dates.startDate"],
      };
    }
    if (filter.endDateBefore) {
      query["dates.endDate"] = {
        $lte: new Date(filter.endDateBefore).toISOString(),
        ...query["dates.endDate"],
      };
    }
    if (filter.endDateAfter) {
      query["dates.endDate"] = {
        $gte: new Date(filter.endDateAfter).toISOString(),
        ...query["dates.endDate"],
      };
    }
    if (filter.participantIds) {
      query["$or"] = [
        { "requestedBy.user": { $in: filter.participantIds } },
        { "interested.user": { $in: filter.participantIds } },
        { "readers.user": { $in: filter.participantIds } },
        { "leaders.user": { $in: filter.participantIds } },
      ];
    }
    if (filter.requestedByIds) {
      query["requestedBy.user"] = { $in: filter.requestedByIds };
    }
    if (filter.interestedIds) {
      query["interested.user"] = { $in: filter.interestedIds };
    }
    if (filter.readerIds) {
      query["readers.user"] = { $in: filter.readerIds };
    }
    if (filter.leaderIds) {
      query["leaders.user"] = { $in: filter.leaderIds };
    }
    return query;
  }
}
