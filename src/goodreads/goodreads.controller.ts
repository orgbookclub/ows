import { Controller, Get, Query } from '@nestjs/common';
import { Book } from '../models/book.dto';
import { GoodreadsService } from './goodreads.service';

@Controller('api/goodreads')
export class GoodreadsController {
  constructor(private goodreadsService: GoodreadsService) {}

  @Get('search')
  async getSearch(@Query('q') query: string): Promise<Array<Book>> {
    try {
      console.log('here!');
      return this.goodreadsService.searchBooks(query);
    } catch (error) {
      console.error(error);
      return new Array<Book>();
    }
  }

  @Get('book')
  async getBook(@Query('q') query: string): Promise<Book> {
    try {
      return this.goodreadsService.getBook(query);
    } catch (error) {
      console.error(error);
      return new Book();
    }
  }

  @Get('quotes')
  async getQuotes(@Query('q') query: string): Promise<Array<string>> {
    try {
      return this.goodreadsService.getQuotes(query);
    } catch (error) {
      console.error(error);
      return new Array<string>();
    }
  }
}
