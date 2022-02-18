import { Injectable } from '@nestjs/common';
import { CreateBookDto } from 'src/common/book.dto';
import { BookRepository } from 'src/repositories/book.repository';

@Injectable()
export class BooksService {
  constructor(private bookRepository: BookRepository) {
    //
  }

  async createBook(createBookDto: CreateBookDto) {
    return await this.bookRepository.createBook(createBookDto);
  }
}
