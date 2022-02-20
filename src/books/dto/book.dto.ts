import { AuthorDto } from './author.dto';

export class BookDto {
  title: string;
  authors: Array<AuthorDto>;
  url: string;
  genres: Array<string>;
}
