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

  findAll() {
    return this.repository.getAll();
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }
  
  async findByUrl(url: string) {
    const books = await this.repository.find({ url: url });
    if (books.length > 1) {
      throw new InternalServerErrorException('Multiple books found');
    }
    return books;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
