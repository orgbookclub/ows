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
    const fields =
      "key,title,author_name,author_key,cover_i,number_of_pages_median,subject";
    const url = `${this.OL_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${k}&fields=${fields}`;
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

    const [workResponse, ratingsResponse] = await Promise.all([
      lastValueFrom(
        this.httpService.get(`${this.OL_BASE_URL}/works/${workId}.json`),
      ),
      lastValueFrom(
        this.httpService.get(
          `${this.OL_BASE_URL}/works/${workId}/ratings.json`,
        ),
      ),
    ]);

    if (!workResponse) {
      throw new ServiceUnavailableException();
    }

    const work = workResponse.data;
    const ratings = ratingsResponse?.data?.summary ?? {};

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
  private mapWorkToBookDto(
    url: string,
    work: any,
    ratings: any,
  ): OpenLibraryBookDto {
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

    const authors: AuthorDto[] = (work.authors ?? []).map((a: any) => ({
      name: "",
      url: `${this.OL_BASE_URL}${a.author?.key ?? a.key ?? ""}`,
    }));

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
}
