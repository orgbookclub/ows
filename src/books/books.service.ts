import { Injectable } from '@nestjs/common';
import { CreateBookDto } from '../common/book.dto';
import { BookRepository } from '../repositories/book.repository';

@Injectable()
export class BooksService {
  constructor(private bookRepository: BookRepository) {
    //
  }

  async createBook(createBookDto: CreateBookDto) {
    return await this.bookRepository.createBook(createBookDto);
  }
}
