import { InternalServerErrorException } from "@nestjs/common";

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
   * @param {string} url The URL of the page.
   * @param {any} body The content of the page to parse.
   */
  constructor(url: string, body: any) {
    super(url, body);
  }

  /**
   * Parses the body treating it as a search page result.
   *
   * @param {number} k Maximum number of results to parse.
   * @returns {BookDto[]} A list of @see BookDto objects.
   */
  public parseSearchPage(k: number): BookDto[] {
    try {
      const tableRows = this.soup("div[class=book-title-author-and-series]");
      return this.extractBooksFromRows(tableRows, k);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Parses the body treating it as a book page.
   *
   * @returns {StorygraphBookDto} An object containing the details of the book.
   */
  public parseBookPage(): StorygraphBookDto {
    try {
      const coverUrl = this.soup("div .book-cover").children("img").attr("src");
      const metaCol = this.soup("div .book-title-author-and-series");
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
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Parses book information from the table rows element in the page.
   *
   * @param {any} tableRows The table rows from the HTML page.
   * @param {number} k The maximum number of rows to parse.
   * @returns {BookDto[]} An array of @see BookDto objects.
   */
  private extractBooksFromRows(tableRows: any, k: number): BookDto[] {
    const bookList: Array<BookDto> = [];
    for (let i = 0; i < Math.min(tableRows.length, k); i++) {
      const book = this.parseSearchResult(this.soup(tableRows[i]));
      bookList.push(book);
    }
    return bookList;
  }

  /**
   * Parses a particular search result to extract the Title, Url, and Authors.
   *
   * @param {any} result A search result.
   * @returns {BookDto} A @see BookDto object.
   */
  private parseSearchResult(result: any): BookDto {
    const td = result.find("h3 > a");
    const url = this.extractUrl(td);
    const title = this.extractText(td);
    const authors = this.extractAuthors(result.find("p").last().find("a"));
    return {
      title: title,
      authors: authors,
      url: url,
      genres: [],
    };
  }

  /**
   * Extracts the book description.
   *
   * @returns {string} The description of the book.
   */
  private extractDescription(): string {
    try {
      return this.soup("div .blurb-pane").text().trim();
    } catch {
      return "No description available";
    }
  }

  /**
   * Extracts the genres of the book.
   *
   * @returns {string[]} A array of genres.
   */
  private extractGenres(): string[] {
    try {
      const genres = [];
      const genreList = this.soup("div[class='leading-3 my-1 md:w-9/12']")
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
   * @returns {any} An object containing the values.
   */
  private extractBookMetaInfo(): any {
    const leftPane = this.soup("div[class='standard-pane mb-5']");

    const avgRating = extractRating();
    const warnings = leftPane
      .find("div .content-warnings-information")
      .first()
      .text()
      .trim();
    const moods = this.extractTupleFields(
      leftPane.find("div .moods-list-reviews").first(),
    );
    const pace = this.extractTupleFields(
      leftPane.find("div .paces-reviews").first(),
    );
    const quesAns = this.extractQuesAndAns(leftPane);
    return { avgRating, warnings, moods, pace, quesAns };

    function extractRating() {
      try {
        return parseFloat(
          leftPane
            .find("span[class='average-star-rating']")
            .text()
            .split(" ")[0]
            .trim(),
        );
      } catch {
        return 0;
      }
    }
  }

  /**
   * Parses and creates a valid SG url from the given field.
   *
   * @param {any} field The given field.
   * @returns {string} A Valid SG Url.
   */
  private extractUrl(field: any): string {
    return "https://app.thestorygraph.com" + field.attr("href").split("?")[0];
  }

  /**
   * Extracts the book title and series information (if any).
   *
   * @param {any} metaCol The field containing book metadata information.
   * @returns {any} Title and series information.
   */
  private extractTitleAndSeries(metaCol: any): any {
    const titleText = metaCol.find("h3 > a").first().text().trim();
    const pFields = metaCol.find("p");
    let seriesText = "";
    if (pFields.length === 2) {
      seriesText = pFields.first().text().trim();
    }
    return { titleText, seriesText };
  }

  /**
   * Extracts the question/answer pairs for the book.
   *
   * @param {any} leftPane The field containing book metadata information.
   * @returns {object[]} An array of objects containing questions and answers.
   */
  private extractQuesAndAns(leftPane: any): object[] {
    const questions = leftPane
      .find("div")
      .last()
      .find("p[class='review-character-question font-semibold mt-4']");
    const answers = leftPane
      .find("div")
      .last()
      .find("span[class='review-response-summary']");
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
   * @param {any} parent The parent field.
   * @returns {object[]} A list of values containing the information.
   */
  private extractTupleFields(parent: any): object[] {
    const childFields = parent.children("span");
    const fields = [];
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
   * @param {any} authorArray The element containing author information.
   * @returns {AuthorDto[]} An array of @see AuthorDto objects.
   */
  private extractAuthors(authorArray: any): Array<AuthorDto> {
    const authors: Array<AuthorDto> = [];
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
