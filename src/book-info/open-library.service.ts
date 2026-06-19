import { HttpService } from "@nestjs/axios";
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { AuthorDto } from "../books/dto/author.dto";
import { BookDto } from "../books/dto/book.dto";

import { OpenLibraryBookDto } from "./dto/open-library-book.dto";

/**
 * The Open Library Service.
 * Responsible for making HTTP calls to the Open Library API
 * and mapping JSON responses to DTOs.
 */
@Injectable()
export class OpenLibraryService {
  /**
   * The base URL for the Open Library API.
   */
  public OL_BASE_URL = "https://openlibrary.org";

  /**
   * The base URL for Open Library cover images.
   */
  private OL_COVERS_URL = "https://covers.openlibrary.org";

  /**
   * Creates an instance of @see OpenLibraryService .
   *
   * @param httpService The HTTP Service.
   */
  constructor(private httpService: HttpService) {
    Logger.debug("Initialized OpenLibraryService");
  }

  /**
   * Searches for books from Open Library.
   *
   * @param query The query string. Can be book title, author, or ISBN.
   * @param k The maximum number of search results.
   * @returns An array of @see BookDto objects.
   */
  async searchBooks(query: string, k: number): Promise<BookDto[]> {
    const limit = Math.min(Math.max(parseInt(String(k)) || 5, 1), 50);
    const fields =
      "key,title,author_name,author_key,cover_i,number_of_pages_median,subject";
    const url = `${this.OL_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`;
    const response = await lastValueFrom(this.httpService.get(url));
    if (!response) {
      throw new ServiceUnavailableException();
    }

    const docs = response.data.docs ?? [];
    return docs.map((doc) => this.mapSearchResultToBookDto(doc));
  }

  /**
   * Gets the details of a single book from Open Library.
   *
   * @param url The URL of the book page. Example: https://openlibrary.org/works/OL679360W.
   * @returns The details of the book.
   */
  async getBook(url: string): Promise<OpenLibraryBookDto> {
    if (!url.startsWith(`${this.OL_BASE_URL}/works/`)) {
      throw new HttpException("Invalid URL", HttpStatus.BAD_REQUEST);
    }

    const workId = url.split("/works/")[1].split("/")[0].split(".")[0];
    if (!workId) {
      throw new HttpException("Invalid URL", HttpStatus.BAD_REQUEST);
    }

    const workResponse = await lastValueFrom(
      this.httpService.get(`${this.OL_BASE_URL}/works/${workId}.json`),
    );
    if (!workResponse) {
      throw new ServiceUnavailableException();
    }

    let ratings = {};
    try {
      const ratingsResponse = await lastValueFrom(
        this.httpService.get(
          `${this.OL_BASE_URL}/works/${workId}/ratings.json`,
        ),
      );
      ratings = ratingsResponse?.data?.summary ?? {};
    } catch {
      ratings = {};
    }

    const work = workResponse.data;
    return this.mapWorkToBookDto(url, work, ratings);
  }

  /**
   * Maps an Open Library search result document to a @see BookDto .
   *
   * @param doc A search result document from the Open Library API.
   * @returns A @see BookDto object.
   */
  private mapSearchResultToBookDto(doc: any): BookDto {
    const authors: AuthorDto[] = (doc.author_name ?? []).map(
      (name: string, i: number) => ({
        name: name,
        url: `${this.OL_BASE_URL}/authors/${doc.author_key?.[i] ?? ""}`,
      }),
    );

    const coverUrl = doc.cover_i
      ? `${this.OL_COVERS_URL}/b/id/${doc.cover_i}-L.jpg`
      : "";

    const genres = (doc.subject ?? [])
      .filter(
        (s: string) =>
          !s.startsWith("nyt:") &&
          !s.startsWith("award:") &&
          !s.includes("fiction") &&
          !s.includes("Fiction"),
      )
      .slice(0, 5);

    return {
      title: doc.title ?? "",
      authors: authors,
      url: `${this.OL_BASE_URL}${doc.key}`,
      genres: genres,
      coverUrl: coverUrl,
      numPages: doc.number_of_pages_median ?? 0,
    };
  }

  /**
   * Maps an Open Library work response to an @see OpenLibraryBookDto .
   *
   * @param url The original URL of the book.
   * @param work The work data from the Open Library API.
   * @param ratings The ratings summary from the Open Library API.
   * @returns An @see OpenLibraryBookDto object.
   */
  private async mapWorkToBookDto(
    url: string,
    work: any,
    ratings: any,
  ): Promise<OpenLibraryBookDto> {
    const description = this.extractDescription(work.description);

    const coverUrl =
      work.covers && work.covers.length > 0
        ? `${this.OL_COVERS_URL}/b/id/${work.covers[0]}-L.jpg`
        : "";

    const subjects = (work.subjects ?? [])
      .filter(
        (s: string) =>
          !s.startsWith("nyt:") &&
          !s.startsWith("award:") &&
          !s.includes("fiction") &&
          !s.includes("Fiction"),
      )
      .slice(0, 5);

    const authors = await this.hydrateAuthors(work.authors ?? []);

    return {
      title: work.title ?? "",
      url: url,
      series: "",
      authors: authors,
      coverUrl: coverUrl,
      avgRating: ratings.average ?? 0,
      numRatings: ratings.count ?? 0,
      description: description,
      genres: subjects,
      numPages: 0,
    };
  }

  /**
   * Extracts a description string from the Open Library description field.
   * The field can be a plain string or an object with a "value" key.
   *
   * @param description The raw description field from the API.
   * @returns A clean description string.
   */
  private extractDescription(description: any): string {
    if (!description) {
      return "No description available";
    }
    if (typeof description === "string") {
      return description;
    }
    if (typeof description === "object" && description.value) {
      return description.value;
    }
    return "No description available";
  }

  /**
   * Fetches author names from the Open Library authors API.
   *
   * @param workAuthors The authors array from the work response.
   * @returns An array of @see AuthorDto objects with hydrated names.
   */
  private async hydrateAuthors(workAuthors: any[]): Promise<AuthorDto[]> {
    const authors: AuthorDto[] = [];
    for (const a of workAuthors) {
      const authorKey = a.author?.key ?? a.key ?? "";
      const authorUrl = `${this.OL_BASE_URL}${authorKey}`;
      let name = "";
      try {
        const response = await lastValueFrom(
          this.httpService.get(`${this.OL_BASE_URL}${authorKey}.json`),
        );
        name = response?.data?.name ?? "";
      } catch {
        name = "";
      }
      authors.push({ name, url: authorUrl });
    }
    return authors;
  }
}
