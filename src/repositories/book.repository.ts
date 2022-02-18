import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookDto } from 'src/common/book.dto';
import { Book, BookDocument } from 'src/schemas/book.schema';

export class BookRepository {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {
    //
  }

  async getAll(): Promise<Array<Book>> {
    return new Array<Book>();
  }

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    const createdBook = new this.bookModel(createBookDto);
    return createdBook.save();
  }
}
