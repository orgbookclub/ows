import { Controller, Get, NotFoundException, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { BookDto } from "../books/dto/book.dto";

import { GoodreadsService } from "./goodreads.service";

/**
 *
 */
@ApiTags("Goodreads")
@Controller("api/goodreads")
export class GoodreadsController {
  /**
   *
   * @param goodreadsService
   */
  constructor(private goodreadsService: GoodreadsService) {
    //
  }

  /**
   *
   * @param query
   * @param k
   */
  @Get("search")
  async searchBooks(
    @Query("q") query: string,
    @Query("k") k = 5,
  ): Promise<Array<BookDto>> {
    return await this.goodreadsService.searchBooks(query, k);
  }

  /**
   *
   * @param query
   */
  @Get("book")
  async searchAndGetBook(@Query("q") query: string) {
    const bookList = await this.goodreadsService.searchBooks(query, 1);
    if (bookList.length === 0) {
      throw new NotFoundException("Could not find a book by that query");
    }
    return await this.goodreadsService.getBook(bookList[0].url);
  }

  /**
   *
   * @param k
   * @param query
   */
  @Get("quotes")
  async getQuotes(
    @Query("k") k = 5,
    @Query("q") query?: string,
  ): Promise<Array<string>> {
    return await this.goodreadsService.getQuotes(k, query);
  }
}
