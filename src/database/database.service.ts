import { Injectable } from '@nestjs/common';
import { Book } from '../models/book.dto';

@Injectable()
export class DatabaseService {
    async getBook(query: string) {
        return new Book();
    }
}
