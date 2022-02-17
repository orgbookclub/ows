import { BookDto } from "../../common/book.dto";


export class GoodreadsBookDto extends BookDto {
  series: string;
  coverUrl: string;
  avgRating: number;
  numRatings: number;
  numReviews: number;
  description: string;
  numPages: number;
  genres: Array<string>;
}
