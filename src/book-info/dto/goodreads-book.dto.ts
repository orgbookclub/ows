import { BookDto } from "../../books/dto/book.dto";

/**
 * Dto for a Goodreads Book.
 */
export class GoodreadsBookDto extends BookDto {
  /**
   * The name of the series, if the book belongs to any.
   *
   * @example "American Gods #1"
   */
  series: string;
  /**
   * The GR link to the cover of the book.
   *
   * @example "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1462924585i/30165203.jpg"
   */
  coverUrl: string;
  /**
   * The average rating of the book.
   *
   * @example 4.11
   */
  avgRating: number;
  /**
   * The total number of ratings for the book.
   *
   * @example 871453
   */
  numRatings: number;
  /**
   * The total number of reviews for the book.
   *
   * @example 43963
   */
  numReviews: number;
  /**
   * The description or blurb of the book.
   *
   * @example "Days before his release from prison, Shadow's wife, Laura, dies in a mysterious car crash.Numbly, he makes his way back home. On the plane, he encounters the enigmatic Mr Wednesday, who claims to be a refugee from a distant war, a former god and the king of America. Together they embark on a profoundly strange journey across the heart of the USA, whilst all around them a storm of preternatural and epic proportions threatens to break. Scary, gripping and deeply unsettling, American Gods takes a long, hard look into the soul of America. You'll be surprised by what - and who - it finds there..."
   */
  description: string;
  /**
   * The number of pages of the book.
   *
   * @example 635
   */
  numPages: number;
}
