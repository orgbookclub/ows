import { HttpService } from "@nestjs/axios";
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { StorygraphParser } from "../book-info/parsers/storygraph-parser";
import { BookDto } from "../books/dto/book.dto";

import { StorygraphBookDto } from "./dto/storygraph-book.dto";

/**
 * The Storygraph Service.
 * Responsible for making HTTP Calls to SG,
 * and using @see StorygraphParser to parse information.
 */
@Injectable()
export class StorygraphService {
  /**
   * Creates an instance of @see StorygraphService .
   *
   * @param httpService The HTTP Service.
   */
  constructor(private httpService: HttpService) {
    Logger.debug("Initialized StorygraphService");
  }
  public SG_BASE_URL = "https://app.thestorygraph.com";
  private parser = StorygraphParser;

  /**
   * For searching books from Storygraph.
   *
   * @param query The query string. Can be book title, author, or ISBN.
   * @param k The maximum number of search results.
   * @returns An array of @see BookDto objects.
   */
  async searchBooks(query: string, k: number) {
    const url = `${this.SG_BASE_URL}/browse?search_term=${query}`;
    const response = await lastValueFrom(this.httpService.get(url));
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new this.parser(url, response.data);
    const results = parser.parseSearchPage(k);
    return results;
  }

  /**
   * Gets the details of a single book from SG.
   *
   * @param url The URL of the book page.
   * @returns The details of the book.
   */
  async getBook(url: string) {
    if (!url.startsWith(`${this.SG_BASE_URL}/books`)) {
      throw new HttpException("Invalid URL", HttpStatus.BAD_REQUEST);
    }
    const response = await lastValueFrom(this.httpService.get(url));
    if (!response) {
      throw new ServiceUnavailableException();
    }
    const parser = new this.parser(url, response.data);
    return parser.parseBookPage();
  }
}
