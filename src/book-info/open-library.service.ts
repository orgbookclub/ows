import { HttpService } from "@nestjs/axios";
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { AxiosError, AxiosResponse } from "axios";
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
   * The User-Agent sent with every Open Library request.
   * Open Library blocks traffic that does not identify itself with a
   * descriptive User-Agent (especially from datacenter IP ranges), so this
   * header is required for the API to work reliably in production.
   */
  private readonly OL_USER_AGENT =
    "OrgBookClub-OWS (https://github.com/orgbookclub/ows)";

  /**
   * The timeout, in milliseconds, applied to every Open Library request.
   */
  private readonly OL_REQUEST_TIMEOUT_MS = 10000;

  /**
   * The maximum number of attempts made for a single Open Library request.
   */
  private readonly OL_MAX_ATTEMPTS = 3;

  /**
   * The base delay, in milliseconds, between retry attempts.
   */
  private readonly OL_RETRY_DELAY_MS = 300;

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
    const response = await this.fetchJson(url);

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

    const [workResponse, ratings, edition] = await Promise.all([
      this.fetchJson(`${this.OL_BASE_URL}/works/${workId}.json`),
      this.getRatings(workId),
      this.getEditionSummary(workId),
    ]);

    const work = workResponse.data;
    return this.mapWorkToBookDto(url, work, ratings, edition);
  }

  /**
   * Fetches the ratings summary for a work.
   * This is best-effort: an empty summary is returned on failure.
   *
   * @param workId The Open Library work identifier.
   * @returns The ratings summary, when available.
   */
  private async getRatings(workId: string): Promise<any> {
    try {
      const response = await this.fetchJson(
        `${this.OL_BASE_URL}/works/${workId}/ratings.json`,
        1,
      );
      return response?.data?.summary ?? {};
    } catch {
      return {};
    }
  }

  /**
   * Resolves the representative edition for a work.
   * Open Library tracks a canonical cover edition and a median page count
   * across all editions, which gives a sensible, popular default instead of
   * the arbitrary edition attached to the work record. This is best-effort:
   * an empty summary is returned on failure so the caller can fall back to
   * work-level data.
   *
   * @param workId The Open Library work identifier.
   * @returns The representative cover id and median page count, when available.
   */
  private async getEditionSummary(
    workId: string,
  ): Promise<{ coverId?: number; numPages?: number }> {
    try {
      const query = encodeURIComponent(`key:/works/${workId}`);
      const response = await this.fetchJson(
        `${this.OL_BASE_URL}/search.json?q=${query}&fields=cover_i,number_of_pages_median`,
        1,
      );
      const doc = response.data?.docs?.[0] ?? {};
      return {
        coverId: doc.cover_i,
        numPages: doc.number_of_pages_median,
      };
    } catch {
      return {};
    }
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
   * @param edition The representative edition summary for the work.
   * @param edition.coverId The cover id of the representative edition.
   * @param edition.numPages The median page count across the work's editions.
   * @returns An @see OpenLibraryBookDto object.
   */
  private async mapWorkToBookDto(
    url: string,
    work: any,
    ratings: any,
    edition: { coverId?: number; numPages?: number },
  ): Promise<OpenLibraryBookDto> {
    const description = this.extractDescription(work.description);

    const coverId =
      edition.coverId ??
      (work.covers && work.covers.length > 0 ? work.covers[0] : undefined);
    const coverUrl = coverId
      ? `${this.OL_COVERS_URL}/b/id/${coverId}-L.jpg`
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
      numPages: edition.numPages ?? 0,
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
        const response = await this.fetchJson(
          `${this.OL_BASE_URL}${authorKey}.json`,
          1,
        );
        name = response?.data?.name ?? "";
      } catch {
        name = "";
      }
      authors.push({ name, url: authorUrl });
    }
    return authors;
  }

  /**
   * Performs a GET request against the Open Library API.
   * Every request includes a descriptive User-Agent and a timeout, and
   * transient failures (network errors, timeouts, and HTTP 429 / 5xx
   * responses) are retried with a short backoff. Open Library blocks
   * requests that lack a descriptive User-Agent and rate limits clients
   * aggressively, which is why both are needed for reliable access from
   * production hosts.
   *
   * @param url The URL to request.
   * @param maxAttempts The maximum number of attempts before giving up.
   * @returns The Axios response.
   */
  private async fetchJson<T = any>(
    url: string,
    maxAttempts: number = this.OL_MAX_ATTEMPTS,
  ): Promise<AxiosResponse<T>> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await lastValueFrom(
          this.httpService.get<T>(url, {
            timeout: this.OL_REQUEST_TIMEOUT_MS,
            headers: {
              "User-Agent": this.OL_USER_AGENT,
              Accept: "application/json",
            },
          }),
        );
      } catch (error) {
        lastError = error;
        const status = (error as AxiosError)?.response?.status;
        Logger.warn(
          `Open Library request failed (attempt ${attempt}/${maxAttempts}, status: ${status ?? "no response"}): ${url}`,
          OpenLibraryService.name,
        );
        if (attempt >= maxAttempts || !this.isRetryable(error)) {
          break;
        }
        await this.delay(this.OL_RETRY_DELAY_MS * attempt);
      }
    }

    const status = (lastError as AxiosError)?.response?.status;
    throw new ServiceUnavailableException(
      `Open Library is currently unavailable (status: ${status ?? "no response"}). Please try again later.`,
    );
  }

  /**
   * Determines whether a failed request is worth retrying.
   * Network errors, timeouts, rate limiting (HTTP 429) and server errors
   * (HTTP 5xx) are treated as transient and retryable; other client errors
   * are not.
   *
   * @param error The error thrown by the failed request.
   * @returns True if the request should be retried.
   */
  private isRetryable(error: unknown): boolean {
    const status = (error as AxiosError)?.response?.status;
    if (status === undefined) {
      return true;
    }
    if (status === 429) {
      return true;
    }
    return status >= 500;
  }

  /**
   * Pauses execution for the given duration.
   *
   * @param ms The number of milliseconds to wait.
   * @returns A promise that resolves once the delay has elapsed.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
