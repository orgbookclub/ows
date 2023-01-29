import { load, CheerioAPI, Cheerio, Element, AnyNode } from "cheerio";

/**
 * A Parser class, extended by @see GoodreadsParser and @see StorygraphParser.
 */
export class Parser {
  url: string;
  soup: CheerioAPI;

  /**
   * Creates an instance of @see Parser.
   *
   * @param url The URL of the page to parse.
   * @param body The body of the page being parsed.
   */
  constructor(url: string, body: string) {
    this.url = url;
    this.soup = load(body);
  }

  /**
   * Extracts the text from a field.
   *
   * @param field The input field.
   * @returns The clean string value.
   */
  protected extractText(field: Cheerio<Element>) {
    return field.text().trim();
  }
}
