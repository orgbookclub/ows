import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { Scopes } from "../auth/scopes.decorator";
import { BookDto } from "../books/dto/book.dto";

import { OpenLibraryBookDto } from "./dto/open-library-book.dto";
import { OpenLibraryService } from "./open-library.service";

/**
 * The Open Library Controller.
 */
@ApiTags("OpenLibrary")
@Controller("api/openlibrary")
@ApiBearerAuth()
export class OpenLibraryController {
  /**
   * Creates an instance of @see OpenLibraryController.
   *
   * @param openLibraryService The service.
   */
  constructor(private openLibraryService: OpenLibraryService) {
    Logger.debug("Initialized OpenLibraryController");
  }

  /**
   * Endpoint for searching books from Open Library.
   *
   * @param query The query string. Can be book title, author, or ISBN.
   * @param k The maximum number of search results.
   * @returns An array of @see BookDto objects.
   */
  @Get("search")
  @Scopes("books:read")
  @ApiOkResponse({
    type: [BookDto],
  })
  async searchBooks(@Query("q") query: string, @Query("k") k: number) {
    const bookList = await this.openLibraryService.searchBooks(query, k);
    if (bookList.length === 0) {
      throw new NotFoundException("Could not find a book by that query");
    }
    return bookList;
  }

  /**
   * Searches for, and gets the details of a single book.
   *
   * @param query The query string.
   * @returns The book details.
   */
  @Get("book")
  @Scopes("books:read")
  @ApiOkResponse({ type: OpenLibraryBookDto })
  async searchAndGetBook(@Query("q") query: string) {
    const bookList = await this.openLibraryService.searchBooks(query, 1);
    if (bookList.length === 0) {
      throw new NotFoundException("Could not find a book by that query");
    }
    return await this.openLibraryService.getBook(bookList[0].url);
  }
}
