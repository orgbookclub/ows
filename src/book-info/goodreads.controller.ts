import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { BookDto } from "../books/dto/book.dto";

import { GoodreadsBookDto } from "./dto/goodreads-book.dto";
import { GoodreadsService } from "./goodreads.service";

/**
 * The Goodreads Controller.
 */
@ApiTags("Goodreads")
@Controller("api/goodreads")
@ApiBearerAuth()
export class GoodreadsController {
  /**
   * Creates an instance of @see GoodreadsController.
   *
   * @param goodreadsService The service.
   */
  constructor(private goodreadsService: GoodreadsService) {
    Logger.debug("Initialized Goodreads Controller");
  }

  /**
   * Endpoint for searching books from Goodreads.
   *
   * @param query The query string. Can be book title, author, or ISBN.
   * @param k The maximum number of search results.
   * @returns An array of @see BookDto objects.
   */
  @Get("search")
  @ApiOkResponse({
    type: [BookDto],
  })
  async searchBooks(@Query("q") query: string, @Query("k") k: number) {
    return await this.goodreadsService.searchBooks(query, k);
  }

  /**
   * Searches for, and gets the details of a single book.
   *
   * @param query The query string.
   * @returns The book details.
   */
  @Get("book")
  @ApiOkResponse({ type: GoodreadsBookDto })
  async searchAndGetBook(@Query("q") query: string) {
    const bookList = await this.goodreadsService.searchBooks(query, 1);
    if (bookList.length === 0) {
      throw new NotFoundException("Could not find a book by that query");
    }
    return await this.goodreadsService.getBook(bookList[0].url);
  }

  /**
   * Searches quotes from Goodreads.
   *
   * @param k The maximum number of results.
   * @param query The query string.
   * @returns A list of quotes.
   */
  @Get("quotes")
  @ApiOkResponse({ type: [String] })
  async getQuotes(@Query("k") k = 5, @Query("q") query?: string) {
    return await this.goodreadsService.getQuotes(k, query);
  }
}
