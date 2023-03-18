import { AuthorDto } from "./author.dto";

/**
 * Dto for a Book.
 * This is further extended by @see StorygraphBookDto and @see GoodreadsBookDto .
 */
export class BookDto {
  /**
   * The title of the book.
   *
   * @example "American Gods"
   */
  title: string;
  /**
   * A list of Author DTOs.
   */
  authors: AuthorDto[];
  /**
   * The GR/SG link to the book page.
   *
   * @example "https://www.goodreads.com/book/show/30165203-american-gods"
   */
  url: string;
  /**
   * The list of genres for the book.
   *
   * @example ["Fantasy", "Fiction", "Science Fiction"]
   */
  genres: string[];
  /**
   * The link to the cover of the book.
   *
   * @example "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1462924585i/30165203.jpg"
   */
  coverUrl: string;
}
