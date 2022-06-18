import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookDto } from '../books/dto/book.dto';
import { StorygraphService } from './storygraph.service';

@ApiTags('Storygraph')
@Controller('api/storygraph')
export class StorygraphController {
  constructor(private bookInfoService: StorygraphService) {
    //
  }

  @Get('search')
  async searchBooks(
    @Query('q') query: string,
    @Query('k') k = 5,
  ): Promise<Array<BookDto>> {
    return await this.bookInfoService.searchBooks(query, k);
  }

  @Get('book')
  async searchAndGetBook(@Query('q') query: string) {
    const bookList = await this.bookInfoService.searchBooks(query, 1);
    if (bookList.length == 0) {
      throw new NotFoundException('Could not find a book by that query');
    }
    return await this.bookInfoService.getBook(bookList[0].url);
  }
}
