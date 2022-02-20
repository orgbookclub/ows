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
  async create(item: Book): Promise<Book> {
    return await this.bookModel.create(item);
  }
  async get(id: string): Promise<Book> {
    throw new Error('Method not implemented.');
  }
  async find(query: any): Promise<Book[]> {
    return this.bookModel.find(query).exec();
  }
  async update(id: string, item: Book): Promise<Book> {
    throw new Error('Method not implemented.');
  }
  async delete(id: string) {
    throw new Error('Method not implemented.');
  }
}
