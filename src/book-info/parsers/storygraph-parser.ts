import { InternalServerErrorException } from "@nestjs/common";

import { AuthorDto } from "../../books/dto/author.dto";
import { BookDto } from "../../books/dto/book.dto";
import { StorygraphBookDto } from "../dto/storygraph-book.dto";

import { Parser } from "./parser";

/**
 *
 */
export class StorygraphParser extends Parser {
  /**
   *
   * @param url
   * @param body
   */
  constructor(url: string, body: any) {
    super(url, body);
  }
  /**
   *
   * @param k
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
   *
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
   *
   * @param tableRows
   * @param k
   */
  private extractBooksFromRows(tableRows, k: number) {
    const bookList: Array<BookDto> = [];
    for (let i = 0; i < Math.min(tableRows.length, k); i++) {
      const book = this.parseSearchResult(this.soup(tableRows[i]));
      bookList.push(book);
    }
    return bookList;
  }

  /**
   *
   * @param result
   */
  private parseSearchResult(result): BookDto {
    const td = result.find("h3 > a");
    const url = this.extractUrl(td);
    const title = this.extractTitle(td);
    const authors = this.extractAuthors(result.find("p").last().find("a"));
    return {
      title: title,
      authors: authors,
      url: url,
      genres: [],
    };
  }

  /**
   *
   */
  private extractDescription() {
    try {
      return this.soup("div .blurb-pane").text().trim();
    } catch {
      return "No description available";
    }
  }

  /**
   *
   */
  private extractGenres() {
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
   *
   */
  private extractBookMetaInfo() {
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
   *
   * @param field
   */
  private extractUrl(field) {
    return "https://app.thestorygraph.com" + field.attr("href").split("?")[0];
  }
  /**
   *
   * @param metaCol
   */
  private extractTitleAndSeries(metaCol) {
    const titleText = metaCol.find("h3 > a").first().text().trim();
    const pFields = metaCol.find("p");
    let seriesText = "";
    if (pFields.length === 2) {
      seriesText = pFields.first().text().trim();
    }
    return { titleText, seriesText };
  }

  /**
   *
   * @param leftPane
   */
  private extractQuesAndAns(leftPane) {
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
   *
   * @param parent
   */
  private extractTupleFields(parent) {
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
   *
   * @param authorArray
   */
  private extractAuthors(authorArray): Array<AuthorDto> {
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
