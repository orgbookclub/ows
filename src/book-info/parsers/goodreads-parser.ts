import { InternalServerErrorException } from "@nestjs/common";
import { Cheerio, Element } from "cheerio";

import { AuthorDto } from "../../books/dto/author.dto";
import { BookDto } from "../../books/dto/book.dto";
import { GoodreadsBookDto } from "../dto/goodreads-book.dto";

import { Parser } from "./parser";

/**
 * A Parser for parsing Goodreads pages.
 * An extension of @see Parser class.
 */
export class GoodreadsParser extends Parser {
  /**
   * Creates an instance of @see GoodreadsParser .
   *
   * @param url The URL of the page.
   * @param body The content of the page to parse.
   */
  constructor(url: string, body: string) {
    super(url, body);
  }

  /**
   * Parses the body treating it as a search page result.
   *
   * @param k Maximum number of results to parse.
   * @returns A list of @see BookDto objects.
   */
  public parseSearchPage(k: number) {
    try {
      const tableRows = this.soup("table[class=tableList]")
        .children("tbody")
        .children("tr");
      return this.extractBooksFromRows(tableRows, k);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Parses the body treating it as a book page.
   *
   * @returns An object containing the details of the book.
   */
  public parseBookPage(): GoodreadsBookDto {
    try {
      const coverUrl = this.soup("img[id=coverImage]").attr("src");
      const metaCol = this.soup("div #metacol");
      const { titleText, seriesText } = this.extractTitleAndSeries(metaCol);
      const authors = this.extractAuthors(metaCol.find("a[class=authorName]"));
      const { avgRating, numRatings, numReviews } =
        this.extractBookMetaInfo(metaCol);
      const description = this.extractDescription(metaCol);
      const numPages = this.extractPages(metaCol);
      const genres = this.extractGenres();
      return {
        title: titleText,
        url: this.url,
        series: seriesText,
        authors: authors,
        coverUrl: coverUrl,
        avgRating: avgRating,
        numRatings: numRatings,
        numReviews: numReviews,
        description: description,
        numPages: numPages,
        genres: genres,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Parses the body treating it as a quotes page.
   *
   * @param k Maximum number of quotes to return.
   * @returns An array of quotes.
   */
  public parseQuotesPage(k: number) {
    try {
      const quotes: string[] = [];
      const quoteDivs = this.soup("div[class=quoteText]");
      for (let i = 0; i < Math.min(quoteDivs.length, k); i++) {
        const quote = this.soup(quoteDivs[i]).text().split("//")[0].trim();
        quotes.push(quote);
      }
      return quotes;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Parses a particular search result to extract the Title, Url, and Authors.
   *
   * @param result A search result.
   * @returns A @see BookDto object.
   */
  private parseSearchResult(result: Cheerio<any>): BookDto {
    const td = result.find("td[width=100%]");
    const url = this.extractUrl(td.children("a"));
    const title = this.extractText(td.children("a"));
    const authors = this.extractAuthors(td.find("a[class=authorName]"));
    return {
      title: title,
      authors: authors,
      url: url,
      genres: [],
    };
  }

  /**
   * Parses book information from the table rows element in the page.
   *
   * @param tableRows The table rows from the HTML page.
   * @param k The maximum number of rows to parse.
   * @returns An array of @see BookDto objects.
   */
  private extractBooksFromRows(tableRows: any, k: number) {
    const bookList: BookDto[] = [];
    for (let i = 0; i < Math.min(tableRows.length, k); i++) {
      const book = this.parseSearchResult(this.soup(tableRows[i]));
      bookList.push(book);
    }
    return bookList;
  }

  /**
   * Parses and creates a valid GR url from the given field.
   *
   * @param field The given field.
   * @returns A Valid GR Url.
   */
  private extractUrl(field: Cheerio<Element>) {
    return `https://www.goodreads.com${field.attr("href").split("?")[0]}`;
  }

  /**
   * Extracts the author name and url from the authors element.
   *
   * @param authorArray The element containing author information.
   * @returns An array of @see AuthorDto objects.
   */
  private extractAuthors(authorArray) {
    const authors: AuthorDto[] = [];
    for (let i = 0; i < authorArray.length; i++) {
      const author = this.soup(authorArray[i]).text().trim();
      const authorUrl = this.soup(authorArray[i]).attr("href").split("?")[0];
      authors.push({ name: author, url: authorUrl });
    }
    return authors;
  }

  /**
   * Extracts avg rating, number of ratings, and number of reviews from the given field.
   *
   * @param metaCol The section containing book metadata information.
   * @returns An object containing the values.
   */
  private extractBookMetaInfo(metaCol: Cheerio<Element>) {
    const bookMeta = metaCol.find("div[id=bookMeta]");
    const avgRating = extractRating();
    const numRatings = extractNumRatings();
    const numReviews = extractNumReviews();
    return { avgRating, numRatings, numReviews };

    function extractNumReviews() {
      try {
        return parseInt(
          bookMeta.find("meta[itemprop=reviewCount]").attr("content"),
        );
      } catch {
        return 0;
      }
    }

    function extractNumRatings() {
      try {
        return parseInt(
          bookMeta.find("meta[itemprop=ratingCount]").attr("content"),
        );
      } catch {
        return 0;
      }
    }

    function extractRating() {
      try {
        return parseFloat(
          bookMeta.find("span[itemprop=ratingValue]").text().trim(),
        );
      } catch {
        return 0;
      }
    }
  }

  /**
   * Extracts the book description from the given field.
   *
   * @param metaCol The field containing book metadata information.
   * @returns The description of the book.
   */
  private extractDescription(metaCol: Cheerio<Element>) {
    try {
      return metaCol
        .find("div[id=description]")
        .children("span")
        .last()
        .text()
        .trim();
    } catch {
      return "No description available";
    }
  }

  /**
   * Extracts the number of pages from the given field.
   *
   * @param metaCol The field containing book metadata information.
   * @returns The number of pages in the book.
   */
  private extractPages(metaCol: Cheerio<Element>) {
    try {
      const pageStr = metaCol.find("span[itemprop=numberOfPages]").text();
      return parseInt(pageStr.split(" ")[0]);
    } catch {
      return 0;
    }
  }

  /**
   * Extracts the genres of the book.
   *
   * @returns A array of genres.
   */
  private extractGenres() {
    try {
      const genres: string[] = [];
      const genreList = this.soup(
        "a[class='actionLinkLite bookPageGenreLink']",
      );
      for (let i = 0; i < genreList.length; i++) {
        const genre = this.soup(genreList[i]).text();
        genres.push(genre);
      }
      return genres;
    } catch {
      return [];
    }
  }

  /**
   * Extracts the book title and series information (if any).
   *
   * @param metaCol The field containing book metadata information.
   * @returns Title and series information.
   */
  private extractTitleAndSeries(metaCol: Cheerio<Element>) {
    const titleText = metaCol.find("h1[id=bookTitle]").text().trim();
    const seriesText = metaCol.find("h2[id=bookSeries]").text().trim();
    return { titleText, seriesText };
  }
}
