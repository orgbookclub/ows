import { BookDto } from "../../books/dto/book.dto";

/**
 * Dto for an Open Library Book.
 */
export class OpenLibraryBookDto extends BookDto {
  /**
   * The name of the series, if the book belongs to any.
   *
   * @example "American Gods #1"
   */
  series: string;

  /**
   * The Open Library link to the cover of the book.
   *
   * @example "https://covers.openlibrary.org/b/id/8494659-L.jpg"
   */
  coverUrl: string;

  /**
   * The average rating of the book.
   *
   * @example 4.2
   */
  avgRating: number;

  /**
   * The total number of ratings for the book.
   *
   * @example 59
   */
  numRatings: number;

  /**
   * The description or blurb of the book.
   *
   * @example "A blend of Americana, fantasy, and various strands of ancient and modern mythology."
   */
  description: string;
}
