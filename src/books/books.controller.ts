import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('Books')
@Controller('api/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {
    Logger.debug('Initialized BooksController');
  }

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    Logger.debug(`Creating book ${JSON.stringify(createBookDto)}...`);
    return this.booksService.create(createBookDto);
  }

  @Get()
  findAll() {
    Logger.debug(`Finding all books...`);
    return this.booksService.findAll();
  }

  @Get(':url')
  findOne(@Param('url') url: string) {
    Logger.debug(`Finding book with url ${url} ...`);
    return this.booksService.findByUrl(url);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
