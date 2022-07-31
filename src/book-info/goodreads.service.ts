import { HttpService } from "@nestjs/axios";
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { BookDto } from "../books/dto/book.dto";

import { GoodreadsParser } from "./parsers/goodreads-parser";

/**
 *
 */
@Injectable()
export class GoodreadsService {
  /**
   *
   * @param httpService
   */
  constructor(private httpService: HttpService) {
    Logger.debug("Initialized GoodreadsService");
  }
  public GR_BASE_URL = "https://www.goodreads.com";
  private parser = GoodreadsParser;

  /**
   *
   * @param query
   * @param k
   */
  async searchBooks(query: string, k: number): Promise<BookDto[]> {
    const url = `${this.GR_BASE_URL}/search?query=${query}&search_type=books`;
    const response = await lastValueFrom(this.httpService.get(url));
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new this.parser(url, response.data);
    const results = parser.parseSearchPage(k);
    return results;
  }

  /**
   *
   * @param url
   */
  async getBook(url: string) {
    if (!url.startsWith(`${this.GR_BASE_URL}/book`)) {
      throw new HttpException("Invalid URL", HttpStatus.BAD_REQUEST);
    }
    const response = await lastValueFrom(this.httpService.get(url));
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new this.parser(url, response.data);
    return parser.parseBookPage();
  }

  /**
   *
   * @param k
   * @param query
   */
  async getQuotes(k: number, query?: string) {
    let url = `${this.GR_BASE_URL}/quotes`;
    if (query) {
      url = url + `/search?q=${query}`;
    }
    const response = await lastValueFrom(this.httpService.get(url));
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new this.parser(url, response.data);
    return parser.parseQuotesPage(k);
  }
}
