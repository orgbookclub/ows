import { Injectable } from '@nestjs/common';
import { Book } from '../models/book.dto';
import axios from 'axios';
import { GoodreadsParser } from './goodreadsParser';

@Injectable()
export class GoodreadsService {
  private GR_BASE_URL = 'https://www.goodreads.com';

  async searchBooks(query: string) {
    const url = `${this.GR_BASE_URL}/search?query=${query}&search_type=books`;
    const response = await axios.get(url);
    const parser = new GoodreadsParser(url, response.data);
    const results = parser.parseSearchPage(10);
    return results;
  }

  // async getBook(query: string) {
  //   return new Book();
  // }

  // async getQuotes(query: string) {
  //   return new Array<string>();
  // }
}
