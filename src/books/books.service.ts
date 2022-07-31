import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";

import { GoodreadsService } from "../book-info/goodreads.service";
import { StorygraphService } from "../book-info/storygraph.service";
import { BookRepository } from "../repositories/book.repository";

import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

/**
 *
 */
@Injectable()
export class BooksService {
  /**
   *
   * @param repository
   * @param goodreadsService
   * @param storygraphService
   */
  constructor(
    private repository: BookRepository,
    private readonly goodreadsService: GoodreadsService,
    private readonly storygraphService: StorygraphService,
  ) {
    Logger.debug("Initialized BooksService");
  }
  /**
   *
   * @param createBookDto
   */
  async createBook(createBookDto: CreateBookDto) {
    const book = await this.findBookByUrl(createBookDto.url);
    if (book != null) {
      throw new ForbiddenException("Book already exists!");
    }
    return await this.repository.create(createBookDto);
  }

  /**
   *
   * @param url
   */
  async createBookFromUrl(url: string) {
    let book: CreateBookDto;
    if (url.startsWith(this.goodreadsService.GR_BASE_URL)) {
      book = await this.goodreadsService.getBook(url);
    } else if (url.startsWith(this.storygraphService.SG_BASE_URL)) {
      book = await this.storygraphService.getBook(url);
    }
    return await this.createBook(book);
  }
  /**
   *
   */
  async getAllBooks() {
    return await this.repository.getAll();
  }

  /**
   *
   * @param id
   */
  async getBook(id: string) {
    return await this.repository.get(id);
  }

  /**
   *
   * @param url
   */
  async findBookByUrl(url: string) {
    const books = await this.repository.find({ url: url });
    if (books.length == 0) {
      return null;
    }
    if (books.length > 1) {
      throw new InternalServerErrorException("Multiple books found");
    }
    return books[0];
  }

  /**
   *
   * @param id
   * @param updateBookDto
   */
  async updateBook(id: string, updateBookDto: UpdateBookDto) {
    return await this.repository.update(id, updateBookDto);
  }

  /**
   *
   * @param id
   */
  async deleteBook(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
