/**
 * Dto for an Author.
 */
export class AuthorDto {
  /**
   * The name of the author.
   *
   * @example "Neil Gaiman"
   */
  name: string;
  /**
   * The GR/SG link to that author's page.
   *
   * @example "https://www.goodreads.com/author/show/1221698.Neil_Gaiman"
   */
  url: string;
}
