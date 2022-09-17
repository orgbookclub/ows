import { Injectable, Logger } from "@nestjs/common";

import { BooksService } from "../books/books.service";
import { BookDocument } from "../books/schemas/book.schema";
import { EventRepository } from "../repositories/event.repository";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

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
   * Gets all event documents from the database.
   */
  async findAll() {
    return await this.repository.getAll();
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
}
