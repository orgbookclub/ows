import { Controller, Get, NotFoundException, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { BookDto } from "../books/dto/book.dto";

import { GoodreadsBookDto } from "./dto/goodreads-book.dto";
import { GoodreadsService } from "./goodreads.service";

/**
 * The Goodreads Controller.
 */
@ApiTags("Goodreads")
@Controller("api/goodreads")
export class GoodreadsController {
  /**
   * Creates an instance of @see GoodreadsController.
   *
   * @param {GoodreadsService} goodreadsService The service.
   */
  constructor(private goodreadsService: GoodreadsService) {
    //
  }

  /**
   * Endpoint for searching books from Goodreads.
   *
   * @param {string} query The query string. Can be book title, author, or ISBN.
   * @param {number} k The maximum number of search results.
   * @returns {Promise<BookDto[]>} An array of @see BookDto objects.
   */
  @Get("search")
  async searchBooks(
    @Query("q") query: string,
    @Query("k") k: number,
  ): Promise<Array<BookDto>> {
    return await this.goodreadsService.searchBooks(query, k);
  }

  /**
   * Searches for, and gets the details of a single book.
   *
   * @param {string} query The query string.
   * @returns {Promise<GoodreadsBookDto>} The book details.
   */
  @Get("book")
  async searchAndGetBook(@Query("q") query: string): Promise<GoodreadsBookDto> {
    const bookList = await this.goodreadsService.searchBooks(query, 1);
    if (bookList.length === 0) {
      throw new NotFoundException("Could not find a book by that query");
    }
    return await this.goodreadsService.getBook(bookList[0].url);
  }

  /**
   * Searches quotes from Goodreads.
   *
   * @param {number} k The maximum number of results.
   * @param {string} query The query string.
   */
  @Get("quotes")
  async getQuotes(
    @Query("k") k = 5,
    @Query("q") query?: string,
  ): Promise<Array<string>> {
    return await this.goodreadsService.getQuotes(k, query);
  }
}
