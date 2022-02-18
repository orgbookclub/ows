import { Author } from "./author.dto";

export class BookDto {
  title: string;
  authors: Array<Author>;
  url: string;
}

export class CreateBookDto {
  title: string;
  authors: Array<Author>;
  url: string;
  genres: Array<string>;
}