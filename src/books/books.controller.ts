import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';

@ApiTags('Books')
@Controller('api/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {
    Logger.debug('Initialized BooksController');
  }

  @Post()
  async createBookFromDto(@Body() createBookDto: CreateBookDto) {
    return await this.booksService.createBook(createBookDto);
  }

  @Post(':url')
  async createBookFromUrl(@Param('url') url: string) {
    return await this.booksService.createBookFromUrl(url);
  }
}
