import { HttpService } from "@nestjs/axios";
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { GoodreadsParser } from "./parsers/goodreads-parser";

/**
 * The Goodreads Service.
 * Responsible for making HTTP Calls to GR,
 * and using @see GoodreadsParser to parse information.
 */
@Injectable()
export class GoodreadsService {
  public GR_BASE_URLS = ["https://www.goodreads.com", "https://goodreads.com"];
  private parser = GoodreadsParser;

  /**
   * Creates an instance of @see GoodreadsService .
   *
   * @param httpService The HTTP Service.
   */
  constructor(private httpService: HttpService) {
    Logger.debug("Initialized GoodreadsService");
  }

  /**
   * For searching books from Goodreads.
   *
   * @param query The query string. Can be book title, author, or ISBN.
   * @param k The maximum number of search results.
   * @returns An array of @see BookDto objects.
   */
  async searchBooks(query: string, k: number) {
    const url = `${this.GR_BASE_URLS[0]}/search?query=${query}&search_type=books`;
    const response = await lastValueFrom(this.httpService.get(url));
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new this.parser(url, response.data);
    const results = parser.parseSearchPage(k);
    return results;
  }

  /**
   * Gets the details of a single book from GR.
   *
   * @param url The URL of the book page.
   * @returns The details of the book.
   */
  async getBook(url: string) {
    if (!this.GR_BASE_URLS.some((x) => url.startsWith(x))) {
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
   * Searches quotes from Goodreads.
   *
   * @param k The maximum number of results.
   * @param query The query string.
   */
  async getQuotes(k: number, query?: string) {
    let url = `${this.GR_BASE_URLS[0]}/quotes`;
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
