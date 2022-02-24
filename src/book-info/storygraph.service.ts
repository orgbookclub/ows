import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { BookDto } from '../books/dto/book.dto';
import { StorygraphParser } from '../book-info/parsers/storygraph-parser';

@Injectable()
export class StorygraphService {
  constructor(private httpService: HttpService) {
    //
  }
  private SG_BASE_URL = 'https://app.thestorygraph.com';
  private parser = StorygraphParser;

  async searchBooks(query: string, k: number): Promise<BookDto[]> {
    const url = `${this.SG_BASE_URL}/browse?search_term=${query}`;
    const response = await lastValueFrom(this.httpService.get(url));
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new this.parser(url, response.data);
    const results = parser.parseSearchPage(k);
    return results;
  }

  async getBook(url: string) {
    if (!url.startsWith(`${this.SG_BASE_URL}/books`)) {
      throw new HttpException('Invalid URL', HttpStatus.BAD_REQUEST);
    }
    const response = await lastValueFrom(this.httpService.get(url));
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new this.parser(url, response.data);
    return parser.parseBookPage();
  }
}
