import { readFileSync } from "fs";

import {
  mockBookResultFromGR,
  mockQuoteResultsFromGR,
  mockSearchResultsFromGR,
} from "../../utils/mockBookValues";

import { GoodreadsParser } from "./goodreads-parser";

describe("GoodreadsParser", () => {
  let goodreadsParser: GoodreadsParser;
  const SAMPLE_DIR_PATH = "src/book-info/samples/";
  const MOCK_SEARCH_PAGE = "gr-search.html";
  const MOCK_BOOK_PAGE = "gr-book.html";

  describe("parseSearchPage", () => {
    beforeEach(() => {
      const data = String(readFileSync(SAMPLE_DIR_PATH + MOCK_SEARCH_PAGE));
      goodreadsParser = new GoodreadsParser("mock url", data);
    });

    it("valid page should return a list of books", () => {
      const actual = goodreadsParser.parseSearchPage(5);
      expect(actual).toEqual(mockSearchResultsFromGR);
    });
  });

  describe("parseBookPage", () => {
    beforeEach(() => {
      const mockUrl =
        "https://www.goodreads.com/book/show/30165203-american-gods";
      const data = String(readFileSync(SAMPLE_DIR_PATH + MOCK_BOOK_PAGE));
      goodreadsParser = new GoodreadsParser(mockUrl, data);
    });

    it("valid page should return a book object", () => {
      const actual = goodreadsParser.parseBookPage();
      expect(actual).toEqual(mockBookResultFromGR);
    });
  });

  describe("parseQuotesPage", () => {
    beforeEach(() => {
      const data = String(readFileSync(SAMPLE_DIR_PATH + "gr-quotes.html"));
      goodreadsParser = new GoodreadsParser("mock url", data);
    });

    it("valid page should return a list of quotes", () => {
      const actual = goodreadsParser.parseQuotesPage(5);
      expect(actual).toEqual(mockQuoteResultsFromGR);
    });
  });
});
