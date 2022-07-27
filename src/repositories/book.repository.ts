import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookDto } from '../books/dto/create-book.dto';
import { Book, BookDocument } from '../books/schemas/book.schema';
import { BaseRepository } from './base.repository';

export class BookRepository extends BaseRepository<Book> {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {
    super();
  }
  async create(item: CreateBookDto) {
    return await this.bookModel.create(item);
  }
  async get(id: number) {
    return await this.bookModel.findById(id).exec();
  }
  async getAll() {
    return await this.bookModel.find().exec();
  }
  async find(query: any) {
    return await this.bookModel.find(query).exec();
  }
  async update(id: number, updateDto) {
    return await this.bookModel.findByIdAndUpdate(id, updateDto, {
      returnDocument: 'after',
    });
  }
  async delete(id: number) {
    return await this.bookModel.findByIdAndRemove(id);
  }
}
