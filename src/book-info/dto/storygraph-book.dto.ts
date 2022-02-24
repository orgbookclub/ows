import { BookDto } from '../../books/dto/book.dto';

export class StorygraphBookDto extends BookDto {
  series: string;
  coverUrl: string;
  avgRating: number;
  warnings: string;
  moods: Array<string>;
  pace: Array<string>;
  quesAns: Array<[string, string]>;
  description: string;
  genres: Array<string>;
}
