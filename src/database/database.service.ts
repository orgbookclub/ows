import { Injectable } from '@nestjs/common';
import { BookDto } from '../models/book.dto';

@Injectable()
export class DatabaseService {
  async getBook(query: string) {
    return new BookDto();
  }
}
