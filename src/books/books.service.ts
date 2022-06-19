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
    const book = await this.findBookByUrl(createBookDto.url);
    if (book != null) {
      throw new ForbiddenException('Book already exists!');
    }
    return await this.repository.create(createBookDto);
  }

  async getAllBooks() {
    return await this.repository.getAll();
  }

  async getBook(id: string) {
    return await this.repository.get(id);
  }

  async findBookByUrl(url: string) {
    const books = await this.repository.find({ url: url });
    if (books.length == 0) {
      return null;
    }
    if (books.length > 1) {
      throw new InternalServerErrorException('Multiple books found');
    }
    return books[0];
  }

  async updateBook(id: string, updateBookDto: UpdateBookDto) {
    return await this.repository.update(id, updateBookDto);
  }

  async deleteBook(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
