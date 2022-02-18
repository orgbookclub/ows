import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { GoodreadsService } from 'src/goodreads/goodreads.service';
import { BookDto, CreateBookDto } from '../common/book.dto';
import { BooksService } from './books.service';

@Controller('api/book')
export class BooksController {
  constructor(
    private booksService: BooksService,
    private goodreadsService: GoodreadsService,
  ) {
    //
  }

  // @Get('test')
  // async testFetchAndCreate(@Query('q') query: string): Promise<BookDto> {
    // const bookList = await this.goodreadsService.searchBooks(query, 1);
    // if (bookList.length == 0) {
    //   throw new NotFoundException('Could not find a book by that query');
    // }
    // const grBook = await this.goodreadsService.getBook(bookList[0].url);
    // const createBookDto: CreateBookDto = {
    //   title: grBook.title,
    //   authors: grBook.authors,
    //   url: grBook.url,
    //   genres: grBook.genres,
    // };
    // return await this.booksService.createBook(createBookDto);
  // }
}
