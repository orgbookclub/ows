import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from '../books/schemas/book.schema';
import { BaseRepository } from './base.repository';

export class BookRepository extends BaseRepository<Book> {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {
    super();
  }
  async create(item: Book) {
    Logger.debug(item);
    return await this.bookModel.create(item);
  }
  async get(id: string) {
    return this.bookModel.findById(id).exec();
  }
  async getAll() {
    return this.bookModel.find().exec();
  }
  async find(query: any) {
    return this.bookModel.find(query).exec();
  }
  async update(id: string, updateDto) {
    return this.bookModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }
  async delete(id: string) {
    return this.bookModel.findByIdAndRemove(id);
  }
}
