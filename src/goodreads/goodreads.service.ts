import { HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Book } from '../models/book.dto';
import axios from 'axios';
import { GoodreadsParser } from './goodreadsParser';

@Injectable()
export class GoodreadsService {
  private GR_BASE_URL = 'https://www.goodreads.com';

  async searchBooks(query: string, k: number): Promise<Book[]> {
    const url = `${this.GR_BASE_URL}/search?query=${query}&search_type=books`;
    const response = await axios.get(url);
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new GoodreadsParser(url, response.data);
    const results = parser.parseSearchPage(k);
    return results;
  }

  async getBook(url: string) {
    if (!url.startsWith(`${this.GR_BASE_URL}/book`)) {
      throw new HttpException("Invalid URL", HttpStatus.BAD_REQUEST);
    }
    const response = await axios.get(url);
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new GoodreadsParser(url, response.data);
    return parser.parseBookPage();
  }

  async getQuotes(k: number, query?: string) {
    let url = `${this.GR_BASE_URL}/quotes`;
    if (query) {
      url = url + `/search?q=${query}`;
    }
    const response = await axios.get(url);
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new GoodreadsParser(url, response.data);
    return parser.parseQuotesPage(k);
  }
}
