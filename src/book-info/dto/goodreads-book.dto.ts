import { BookDto } from '../../books/dto/book.dto';

export class GoodreadsBookDto extends BookDto {
  series: string;
  coverUrl: string;
  avgRating: number;
  numRatings: number;
  numReviews: number;
  description: string;
  numPages: number;
}
