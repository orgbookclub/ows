import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { BookDto } from "../books/dto/book.dto";

import { StorygraphBookDto } from "./dto/storygraph-book.dto";
import { StorygraphService } from "./storygraph.service";

/**
 * The Storygraph Controller.
 */
@ApiTags("Storygraph")
@Controller("api/storygraph")
export class StorygraphController {
  /**
   * Creates an instance of @see StorygraphController.
   *
   * @param storygraphService The service.
   */
  constructor(private storygraphService: StorygraphService) {
    Logger.debug("Initialized StorygraphController");
  }

  /**
   * Endpoint for searching books from Storygraph.
   *
   * @param query The query string. Can be book title, author, or ISBN.
   * @param k The maximum number of search results.
   * @returns An array of @see BookDto objects.
   */
  @Get("search")
  @ApiOkResponse({ type: [BookDto] })
  async searchBooks(@Query("q") query: string, @Query("k") k = 5) {
    return await this.storygraphService.searchBooks(query, k);
  }

  /**
   * Searches for, and gets the details of a single book.
   *
   * @param query The query string.
   * @returns The book details.
   */
  @Get("book")
  @ApiOkResponse({ type: StorygraphBookDto })
  async searchAndGetBook(@Query("q") query: string) {
    const bookList = await this.storygraphService.searchBooks(query, 1);
    if (bookList.length === 0) {
      throw new NotFoundException("Could not find a book by that query");
    }
    return await this.storygraphService.getBook(bookList[0].url);
  }
}
