import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BookRepository } from '../repositories/book.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private repository: BookRepository) {
    Logger.debug('Initialized BooksService');
  }
  async createBook(createBookDto: CreateBookDto) {
    const books = await this.findBooksByUrl(createBookDto.url);
    if (books.length) {
      throw new ForbiddenException('Book already exists!');
    }
    return this.repository.create(createBookDto);
  }

  async getAllBooks() {
    return this.repository.getAll();
  }

  async getBook(id: string) {
    return await this.repository.get(id);
  }

  async findBooksByUrl(url: string) {
    const books = await this.repository.find({ url: url });
    if (books.length > 1) {
      throw new InternalServerErrorException('Multiple books found');
    }
    return books;
  }

  async updateBook(id: string, updateBookDto: UpdateBookDto) {
    return await this.repository.update(id, updateBookDto);
  }

  async deleteBook(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
