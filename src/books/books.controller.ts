import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoodreadsService } from '../book-info/goodreads.service';
import { StorygraphService } from '../book-info/storygraph.service';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';

@ApiTags('Books')
@Controller('api/books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly goodreadsService: GoodreadsService,
    private readonly storygraphService: StorygraphService,
  ) {
    Logger.debug('Initialized BooksController');
  }

  @Post('create')
  async createBookFromDto(@Body() createBookDto: CreateBookDto) {
    return await this.booksService.createBook(createBookDto);
  }

  @Get('create')
  async createBookFromUrl(@Query('url') url: string) {
    let book: CreateBookDto;
    if (url.startsWith(this.goodreadsService.GR_BASE_URL)) {
      book = await this.goodreadsService.getBook(url);
    } else if (url.startsWith(this.storygraphService.SG_BASE_URL)) {
      book = await this.storygraphService.getBook(url);
    }
    return await this.booksService.createBook(book);
  }
}
