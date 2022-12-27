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
   * @param {BookRepository} repository The repository which handles DB operations.
   * @param {GoodreadsService} goodreadsService Service for fetching Book info from Goodreads.
   * @param {StorygraphService} storygraphService Service for fetching Book info from Storygraph.
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
   * @param {CreateBookDto} createBookDto The Dto object.
   * @returns {Promise<BookDocument>} The created book document.
   */
  async createBook(createBookDto: CreateBookDto): Promise<BookDocument> {
    const book = await this.findBookByUrl(createBookDto.url);
    if (book !== null) {
      throw new ForbiddenException("Book already exists!");
    }
    return await this.repository.create(createBookDto);
  }

  /**
   * Creates a book from a given URL.
   *
   * @param {string} url A Valid GR or SG URL.
   * @returns {Promise<BookDocument>} The created book document.
   */
  async createBookFromUrl(url: string): Promise<BookDocument> {
    let book: CreateBookDto;
    if (
      url.startsWith(this.goodreadsService.GR_BASE_URL) ||
      url.startsWith(this.goodreadsService.GR_BASE_URL2)
    ) {
      book = await this.goodreadsService.getBook(url);
    } else if (url.startsWith(this.storygraphService.SG_BASE_URL)) {
      book = await this.storygraphService.getBook(url);
    }
    return await this.createBook(book);
  }

  /**
   * Gets all book documents from the DB.
   *
   * @returns {Promise<BookDocument[]>} A list of book documents.
   */
  async getAllBooks(): Promise<BookDocument[]> {
    return await this.repository.getAll();
  }

  /**
   * Gets the book with the given ID from the database.
   *
   * @param {string} id The object ID of the document.
   * @returns {Promise<BookDocument>} A book document.
   */
  async getBook(id: string): Promise<BookDocument> {
    return await this.repository.get(id);
  }

  /**
   * Gets the book with the given URL from the database.
   * Throws an error if multiple books with the same URL are found.
   *
   * @param {string} url The URL of the book.
   * @returns {Promise<BookDocument>} A book document.
   */
  async findBookByUrl(url: string): Promise<BookDocument> {
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
   * @param {string} query The query string.
   * @returns {Promise<BookDocument[]>} A list of books.
   */
  async findBooks(query: string): Promise<BookDocument[]> {
    const books = await this.repository.find({ $text: { $search: query } });
    return books;
  }

  /**
   * Updates the book document with the given ID.
   *
   * @param {string} id The Object ID of the document.
   * @param {UpdateBookDto} updateBookDto The Dto object which contains the updated fields.
   * @returns {Promise<BookDocument>} The updated book document.
   */
  async updateBook(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookDocument> {
    return await this.repository.update(id, updateBookDto);
  }

  /**
   * Deletes a book document with the given ID.
   *
   * @param {string} id The object ID of the document.
   * @returns {Promise<boolean>} True if the delete operation is successful.
   */
  async deleteBook(id: string): Promise<boolean> {
    await this.repository.delete(id);
    return true;
  }
}
