import { Injectable } from '@nestjs/common';
import { Book } from '../models/book.dto';
import axios from 'axios';
import { GoodreadsParser } from './goodreadsParser';

@Injectable()
export class GoodreadsService {
  private GR_BASE_URL = 'https://www.goodreads.com';

  async searchBooks(query: string, k: number): Promise<Book[]> {
    const url = `${this.GR_BASE_URL}/search?query=${query}&search_type=books`;
    const response = await axios.get(url);
    const parser = new GoodreadsParser(url, response.data);
    const results = parser.parseSearchPage(k);
    return results;
  }

  async getBook(url: string) {
    const response = await axios.get(url);
    const parser = new GoodreadsParser(url, response.data);
    return parser.parseBookPage();
  }

  async getQuotes(k: number, query?: string) {
    let url = `${this.GR_BASE_URL}/quotes`;
    if (!query) {
      url = url + `?q=${query}`;
    }
    const response = await axios.get(url);
    const parser = new GoodreadsParser(url, response.data);
    return parser.parseQuotesPage(k);
  }
}
