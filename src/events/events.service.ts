import { Injectable, Logger } from "@nestjs/common";

import { BooksService } from "../books/books.service";
import { EventRepository } from "../repositories/event.repository";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

/**
 *
 */
@Injectable()
export class EventsService {
  /**
   *
   * @param repository
   * @param booksService
   */
  constructor(
    private repository: EventRepository,
    private readonly booksService: BooksService,
  ) {
    Logger.debug("Initialized EventsService");
  }

  /**
   *
   * @param createEventDto
   */
  async create(createEventDto: CreateEventDto) {
    return await this.repository.create(createEventDto);
  }

  /**
   *
   * @param url
   * @param createEventDto
   */
  async createFromUrl(url: string, createEventDto: CreateEventDto) {
    let book = null;
    book = await this.booksService.findBookByUrl(url);
    if (book == null) book = await this.booksService.createBookFromUrl(url);
    createEventDto.book = book;
    return await this.repository.create(createEventDto);
  }

  /**
   *
   */
  async findAll() {
    return await this.repository.getAll();
  }

  /**
   *
   * @param id
   */
  async findOne(id: string) {
    return await this.repository.get(id);
  }

  /**
   *
   * @param id
   * @param updateEventDto
   */
  async update(id: string, updateEventDto: UpdateEventDto) {
    return await this.repository.update(id, updateEventDto);
  }

  /**
   *
   * @param id
   */
  async remove(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
