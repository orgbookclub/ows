import { Author } from "./author.dto";

export class BookDto {
  title: string;
  authors: Array<Author>;
  url: string;
}
