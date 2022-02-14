import { Controller, Get, Query } from '@nestjs/common';
import { Book } from '../models/book.dto';
import { GoodreadsService } from './goodreads.service';

@Controller('api/goodreads')
export class GoodreadsController {
  constructor(private goodreadsService: GoodreadsService) {
    console.log('Initalized Goodreads Controller');
  }

  @Get('search')
  async searchBooks(@Query('q') query: string, @Query('k') k = 5): Promise<Array<Book>> {
      return this.goodreadsService.searchBooks(query, k);
  }

  @Get('book')
  async searchAndGetBook(@Query('q') query: string): Promise<Book> {
      const bookList = await this.goodreadsService.searchBooks(query, 1);
      if (bookList.length != 1)
      {
        // throw error
      }
      return this.goodreadsService.getBook(bookList[0].url);
  }

  @Get('quotes')
  async getQuotes(@Query('k') k = 5, @Query('q') query?: string,): Promise<Array<string>> {
      return this.goodreadsService.getQuotes(k, query);
  }
}
