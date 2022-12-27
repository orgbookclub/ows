import { AuthorDto } from "./author.dto";

/**
 * Dto for a Book.
 * This is further extended by @see StorygraphBookDto and @see GoodreadsBookDto .
 */
export class BookDto {
  title: string;
  authors: AuthorDto[];
  url: string;
  genres: string[];
}
