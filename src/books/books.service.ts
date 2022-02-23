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
  async create(createBookDto: CreateBookDto) {
    const books = await this.findByUrl(createBookDto.url);
    if (books.length) {
      throw new ForbiddenException('Book already exists!');
    }
    return this.repository.create(createBookDto);
  }

  async findAll() {
    return this.repository.getAll();
  }

  async findOne(id: string) {
    return await this.repository.get(id);
  }

  async findByUrl(url: string) {
    const books = await this.repository.find({ url: url });
    if (books.length > 1) {
      throw new InternalServerErrorException('Multiple books found');
    }
    return books;
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    return await this.repository.update(id, updateBookDto);
  }

  async remove(id: string) {
    await this.repository.delete(id);
    return true;
  }
}
