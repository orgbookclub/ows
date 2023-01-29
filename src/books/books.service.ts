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
import { BookDocument } from "./schemas/book.schema";

/**
 * The Books Service.
 */
@Injectable()
export class BooksService {
  /**
   * Initializes an instance of BooksService.
   *
   * @param repository The repository which handles DB operations.
   * @param goodreadsService Service for fetching Book info from Goodreads.
   * @param storygraphService Service for fetching Book info from Storygraph.
   */
  constructor(
    private repository: BookRepository,
    private readonly goodreadsService: GoodreadsService,
    private readonly storygraphService: StorygraphService,
  ) {
    Logger.debug("Initialized BooksService");
  }

  /**
   * Creates a book from the given Dto object.
   *
   * @param createBookDto The Dto object.
   * @returns The created book document.
   */
  async createBook(createBookDto: CreateBookDto) {
    const book = await this.findBookByUrl(createBookDto.url);
    if (book !== null) {
      throw new ForbiddenException("Book already exists!");
    }
    return await this.repository.create(createBookDto);
  }

  /**
   * Creates a book from a given URL.
   *
   * @param url A Valid GR or SG URL.
   * @returns The created book document.
   */
  async createBookFromUrl(url: string) {
    let book: CreateBookDto;
    if (this.goodreadsService.GR_BASE_URLS.some((x) => url.startsWith(x))) {
      book = await this.goodreadsService.getBook(url);
    } else if (url.startsWith(this.storygraphService.SG_BASE_URL)) {
      book = await this.storygraphService.getBook(url);
    }
    return await this.createBook(book);
  }

  /**
   * Gets all book documents from the DB.
   *
   * @returns A list of book documents.
   */
  async getAllBooks() {
    return await this.repository.getAll();
  }

  /**
   * Gets the book with the given ID from the database.
   *
   * @param id The object ID of the document.
   * @returns A book document.
   */
  async getBook(id: string) {
    return await this.repository.get(id);
  }

  /**
   * Gets the book with the given URL from the database.
   * Throws an error if multiple books with the same URL are found.
   *
   * @param url The URL of the book.
   * @returns A book document.
   */
  async findBookByUrl(url: string) {
    const books = await this.repository.find({ url: url });
    if (books.length === 0) {
      return null;
    }
    if (books.length > 1) {
      throw new InternalServerErrorException("Multiple books found");
    }
    return books[0];
  }

  /**
   * Returns a list of books after doing a text search on the given query string.
   *
   * @param query The query string.
   * @returns A list of books.
   */
  async findBooks(query: string) {
    const books = await this.repository.find({ $text: { $search: query } });
    return books;
  }

  /**
   * Updates the book document with the given ID.
   *
   * @param id The Object ID of the document.
   * @param updateBookDto The Dto object which contains the updated fields.
   * @returns The updated book document.
   */
  async updateBook(id: string, updateBookDto: UpdateBookDto) {
    return await this.repository.update(id, updateBookDto);
  }

  /**
   * Deletes a book document with the given ID.
   *
   * @param id The object ID of the document.
   * @returns True if the delete operation is successful.
   */
  async deleteBook(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
