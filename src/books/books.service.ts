import { Injectable, Logger } from '@nestjs/common';
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
      throw new Error('Book already exists!');
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
    return await this.repository.find({ url: url });
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
