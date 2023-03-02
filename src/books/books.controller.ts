import { Body, Controller, Logger, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { BooksService } from "./books.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { BookDocument } from "./schemas/book.schema";

/**
 * The Books controller.
 * This interacts with the @see Book objects stored in the database.
 */
@ApiTags("Books")
@Controller("api/books")
@ApiBearerAuth()
export class BooksController {
  /**
   * Initializes an instance of BookController.
   *
   * @param booksService The books service.
   */
  constructor(private readonly booksService: BooksService) {
    Logger.debug("Initialized BooksController");
  }

  /**
   * Creates a book from the given Dto object.
   *
   * @param createBookDto The Dto object.
   * @returns A Book document.
   */
  @Post()
  @ApiOkResponse({ type: BookDocument })
  async createBookFromDto(@Body() createBookDto: CreateBookDto) {
    return await this.booksService.createBook(createBookDto);
  }

  /**
   * Creates a book from the given valid URL.
   *
   * @param url A valid Goodreads or Storygraph URL.
   * @returns A Book document.
   */
  @Post(":url")
  @ApiOkResponse({ type: BookDocument })
  async createBookFromUrl(@Param("url") url: string) {
    return await this.booksService.createBookFromUrl(url);
  }
}
