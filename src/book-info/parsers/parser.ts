import { load, CheerioAPI } from "cheerio";

/**
 * A Parser class, extended by @see GoodreadsParser and @see StorygraphParser.
 */
export class Parser {
  url: string;
  soup: CheerioAPI;

  /**
   * Creates an instance of @see Parser.
   *
   * @param {string} url The URL of the page to parse.
   * @param {any} body The body of the page being parsed.
   */
  constructor(url: string, body: any) {
    this.url = url;
    this.soup = load(body);
  }

  /**
   * Extracts the text from a field.
   *
   * @param {any} field The input field.
   * @returns {string} The clean string value.
   */
  protected extractText(field: any): string {
    return field.text().trim();
  }
}
