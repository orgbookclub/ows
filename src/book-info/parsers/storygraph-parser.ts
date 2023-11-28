import { InternalServerErrorException, Logger } from "@nestjs/common";
import { Cheerio, CheerioAPI, Element } from "cheerio";

import { AuthorDto } from "../../books/dto/author.dto";
import { BookDto } from "../../books/dto/book.dto";
import { StorygraphBookDto } from "../dto/storygraph-book.dto";

import { Parser } from "./parser";

/**
 * A Parser for parsing Storygraph pages.
 * An extension of @see Parser class.
 */
export class StorygraphParser extends Parser {
  /**
   * Creates an instance of  @see StorygraphParser .
   *
   * @param url The URL of the page.
   * @param body The content of the page to parse.
   */
  constructor(url: string, body: string) {
    super(url, body);
    Logger.debug("Initalized StorygraphParser");
  }

  /**
   * Parses the body treating it as a search page result.
   *
   * @param k Maximum number of results to parse.
   * @returns A list of @see BookDto objects.
   */
  public parseSearchPage(k: number) {
    try {
      const tableRows = this.soup(
        "div[class='book-pane-content grid grid-cols-10']",
      );
      return this.extractBooksFromRows(tableRows, k);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Parses the body treating it as a book page.
   *
   * @returns An object containing the details of the book.
   */
  public parseBookPage(): StorygraphBookDto {
    try {
      const coverUrl = this.soup("div .book-cover").children("img").attr("src");
      const metaCol = this.soup("div .book-title-author-and-series");
      const pages = parseInt(
        this.soup(
          "p[class='text-sm font-light text-darkestGrey dark:text-grey mt-1']",
        )
          .text()
          .trim()
          .split("pages")[0]
          .trim(),
      );
      const { titleText, seriesText } = this.extractTitleAndSeries(metaCol);
      const authors = this.extractAuthors(metaCol.find("p").last().find("a"));
      const { avgRating, warnings, moods, pace, quesAns } =
        this.extractBookMetaInfo();
      const description = this.extractDescription();
      const genres = this.extractGenres();
      return {
        title: titleText,
        url: this.url,
        series: seriesText,
        authors: authors,
        coverUrl: coverUrl,
        avgRating: avgRating,
        warnings: warnings,
        moods: moods,
        pace: pace,
        quesAns: quesAns,
        description: description,
        genres: genres,
        numPages: pages,
      };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Parses book information from the table rows element in the page.
   *
   * @param tableRows The table rows from the HTML page.
   * @param k The maximum number of rows to parse.
   * @returns An array of @see BookDto objects.
   */
  private extractBooksFromRows(tableRows: Cheerio<Element>, k: number) {
    const bookList: BookDto[] = [];
    for (let i = 0; i < Math.min(tableRows.length, k); i++) {
      const book = this.parseSearchResult(this.soup(tableRows[i]));
      bookList.push(book);
    }
    return bookList;
  }

  /**
   * Parses a particular search result to extract the Title, Url, and Authors.
   *
   * @param element A search result.
   * @returns A @see BookDto object.
   */
  private parseSearchResult(element: Cheerio<Element>): BookDto {
    try {
      const result = this.soup(
        element.find("div .book-title-author-and-series"),
      );
      const td = result.find("h1 > a");
      const url = this.extractUrl(td);
      const title = this.extractText(td);
      const authors = this.extractAuthors(result.find("p").last().find("a"));
      const coverUrl = element
        .find("div .book-cover")
        .find("img")
        .last()
        .attr("src");
      return {
        title: title,
        authors: authors,
        url: url,
        genres: [],
        coverUrl: coverUrl,
        numPages: 0,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Extracts the book description.
   *
   * @returns The description of the book.
   */
  private extractDescription() {
    try {
      return this.soup("div .blurb-pane").text().trim();
    } catch {
      return "No description available";
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
      const genreList = this.soup("div[class=book-page-tag-section]")
        .last()
        .children("span");
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
   * Extracts avg rating, warnings, moods, and pace of the book.
   *
   * @returns An object containing the values.
   */
  private extractBookMetaInfo() {
    const avgRating = extractRating(this.soup);
    const warnings = this.soup("div .content-warnings-information")
      .last()
      .text()
      .trim();
    const moods = this.extractTupleFields(
      this.soup("div .moods-list-reviews").first(),
    );
    const pace = this.extractTupleFields(
      this.soup("div .paces-reviews").first(),
    );
    const quesAns = this.extractQuesAndAns(
      this.soup(
        "div[class='mb-6 md:mb-0 mt-6 px-2 md:px-unset md:standard-pane md:block book-pane break-words']",
      ).last(),
    );
    return { avgRating, warnings, moods, pace, quesAns };

    function extractRating(soup: CheerioAPI) {
      try {
        return parseFloat(
          soup("span[class='average-star-rating']").text().split(" ")[0].trim(),
        );
      } catch {
        return 0;
      }
    }
  }

  /**
   * Parses and creates a valid SG url from the given field.
   *
   * @param field The given field.
   * @returns A Valid SG Url.
   */
  private extractUrl(field: Cheerio<Element>) {
    return "https://app.thestorygraph.com" + field.attr("href").split("?")[0];
  }

  /**
   * Extracts the book title and series information (if any).
   *
   * @param element The field containing book metadata information.
   * @returns Title and series information.
   */
  private extractTitleAndSeries(element: Cheerio<Element>) {
    const titleText = element.find("h3").first().text().split("\n")[0].trim();
    const pFields = element.find("p");
    let seriesText = "";
    if (pFields.length === 4) {
      seriesText = pFields.first().text().trim();
    }
    return { titleText, seriesText };
  }

  /**
   * Extracts the question/answer pairs for the book.
   *
   * @param element The field containing book metadata information.
   * @returns An array of objects containing questions and answers.
   */
  private extractQuesAndAns(element: Cheerio<Element>) {
    const questions = element.find(
      "p[class='review-character-question font-semibold mt-4']",
    );
    const answers = element.find("span[class='review-response-summary']");
    const quesAns = [];
    for (let i = 0; i < questions.length; i++) {
      const question = this.soup(questions[i]).text().trim();
      const answer = this.soup(answers[i]).text().trim();
      quesAns.push({ question: question, answer: answer });
    }
    return quesAns;
  }

  /**
   * Extracts values into readable `fieldName (field %age)` strings.
   *
   * @param parent The parent field.
   * @returns A list of values containing the information.
   */
  private extractTupleFields(parent: Cheerio<Element>) {
    const childFields = parent.children("span");
    const fields: string[] = [];
    let field = "";
    for (let i = 0; i < childFields.length; i++) {
      if (i % 2 === 0) {
        if (field !== "") {
          fields.push(field);
          field = "";
        }
        field = this.soup(childFields[i]).text().trim();
      } else {
        field += `(${this.soup(childFields[i]).text().trim()})`;
      }
    }
    if (field !== "") {
      fields.push(field);
    }
    return fields;
  }

  /**
   * Extracts the author name and url from the authors element.
   *
   * @param authorArray The element containing author information.
   * @returns An array of @see AuthorDto objects.
   */
  private extractAuthors(authorArray: any[] | Cheerio<Element>): AuthorDto[] {
    const authors: AuthorDto[] = [];
    for (let i = 0; i < authorArray.length; i++) {
      const author = this.soup(authorArray[i]).text().trim();
      const authorUrl =
        "https://app.thestorygraph.com" +
        this.soup(authorArray[i]).attr("href").split("?")[0];
      authors.push({ name: author, url: authorUrl });
    }
    return authors;
  }
}
