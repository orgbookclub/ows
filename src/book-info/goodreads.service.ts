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

import { GoodreadsBookDto } from "./dto/goodreads-book.dto";
import { GoodreadsParser } from "./parsers/goodreads-parser";

/**
 * The Goodreads Service.
 * Responsible for making HTTP Calls to GR,
 * and using @see GoodreadsParser to parse information.
 */
@Injectable()
export class GoodreadsService {
  /**
   * Creates an instance of @see GoodreadsService .
   *
   * @param {HttpService} httpService The HTTP Service.
   */
  constructor(private httpService: HttpService) {
    Logger.debug("Initialized GoodreadsService");
  }
  public GR_BASE_URL = "https://www.goodreads.com";
  private parser = GoodreadsParser;

  /**
   * For searching books from Goodreads.
   *
   * @param {string} query The query string. Can be book title, author, or ISBN.
   * @param {number} k The maximum number of search results.
   * @returns {Promise<BookDto[]>} An array of @see BookDto objects.
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
   * Gets the details of a single book from GR.
   *
   * @param {string} url The URL of the book page.
   * @returns {Promise<GoodreadsBookDto>} The details of the book.
   */
  async getBook(url: string): Promise<GoodreadsBookDto> {
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
   * Searches quotes from Goodreads.
   *
   * @param {number} k The maximum number of results.
   * @param {string} query The query string.
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
