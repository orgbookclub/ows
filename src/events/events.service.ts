import { Injectable, Logger } from '@nestjs/common';
import { BooksService } from '../books/books.service';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private repository: EventRepository,
    private readonly booksService: BooksService,
  ) {
    Logger.debug('Initialized EventsService');
  }

  async create(createEventDto: CreateEventDto) {
    return await this.repository.create(createEventDto);
  }

  async createFromUrl(url: string, createEventDto: CreateEventDto) {
    let book = null;
    book = await this.booksService.findBookByUrl(url);
    if (book == null) book = await this.booksService.createBookFromUrl(url);
    createEventDto.book = book;
    return await this.repository.create(createEventDto);
  }

  async findAll() {
    return await this.repository.getAll();
  }

  async findOne(id: string) {
    return await this.repository.get(id);
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    return await this.repository.update(id, updateEventDto);
  }

  async remove(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
