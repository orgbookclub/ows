import { Body, Controller, Logger, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { BooksService } from "./books.service";
import { CreateBookDto } from "./dto/create-book.dto";

/**
 * The Books controller.
 * This interacts with the @see Book objects stored in the database.
 */
@ApiTags("Books")
@Controller("api/books")
export class BooksController {
  /**
   * Initializes an instance of BookController.
   *
   * @param {BooksService} booksService The books service.
   */
  constructor(private readonly booksService: BooksService) {
    Logger.debug("Initialized BooksController");
  }

  /**
   * Creates a book from the given Dto object.
   *
   * @param {CreateBookDto} createBookDto The Dto object.
   */
  @Post()
  async createBookFromDto(@Body() createBookDto: CreateBookDto) {
    return await this.booksService.createBook(createBookDto);
  }

  /**
   * Creates a book from the given valid URL.
   *
   * @param {string} url A valid Goodreads or Storygraph URL.
   */
  @Post(":url")
  async createBookFromUrl(@Param("url") url: string) {
    return await this.booksService.createBookFromUrl(url);
  }
}
