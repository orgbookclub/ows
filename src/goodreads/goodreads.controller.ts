import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { BookDto } from '../common/book.dto';
import { GoodreadsService } from './goodreads.service';

@Controller('api/goodreads')
export class GoodreadsController {
  constructor(private goodreadsService: GoodreadsService) {
    //
  }

  @Get('search')
  async searchBooks(
    @Query('q') query: string,
    @Query('k') k = 5,
  ): Promise<Array<BookDto>> {
    return this.goodreadsService.searchBooks(query, k);
  }

  @Get('book')
  async searchAndGetBook(@Query('q') query: string): Promise<BookDto> {
    const bookList = await this.goodreadsService.searchBooks(query, 1);
    if (bookList.length == 0) {
      throw new NotFoundException('Could not find a book by that query');
    }
    return this.goodreadsService.getBook(bookList[0].url);
  }

  @Get('quotes')
  async getQuotes(
    @Query('k') k = 5,
    @Query('q') query?: string,
  ): Promise<Array<string>> {
    return this.goodreadsService.getQuotes(k, query);
  }
}
