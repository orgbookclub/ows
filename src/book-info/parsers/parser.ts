import cheerio, { CheerioAPI } from "cheerio";

/**
 *
 */
export class Parser {
  url: string;
  soup: CheerioAPI;

  /**
   *
   * @param url
   * @param body
   */
  constructor(url: string, body) {
    this.url = url;
    this.soup = cheerio.load(body);
  }

  /**
   *
   * @param field
   */
  protected extractTitle(field) {
    return field.text().trim();
  }
}
