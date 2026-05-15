import { load, CheerioAPI, Cheerio } from "cheerio";
import { Element } from "domhandler";

/**
 * A Parser class, extended by @see GoodreadsParser and @see StorygraphParser.
 */
export class Parser {
  /**
   * The URL of the page to parse.
   */
  url: string;

  /**
   * The CheerioAPI object, named as soup due to legacy reasons from moving over from BeautifulSoup.
   */
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
