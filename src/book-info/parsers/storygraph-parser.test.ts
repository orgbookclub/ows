import { readFileSync } from "fs";

import {
  mockSearchResultsFromSG,
  mockBookResultFromSG,
} from "../../utils/mockBookValues";

import { StorygraphParser } from "./storygraph-parser";

describe("StorygraphParser", () => {
  let parser: StorygraphParser;
  const SAMPLE_DIR_PATH = "src/book-info/samples/";
  const MOCK_SEARCH_PAGE = "sg-search.html";
  const MOCK_BOOK_PAGE = "sg-book.html";

  describe("parseSearchPage", () => {
    beforeEach(() => {
      const data = String(readFileSync(SAMPLE_DIR_PATH + MOCK_SEARCH_PAGE));
      parser = new StorygraphParser("https://mockurl.com", data);
    });

    it("should return a list of books", () => {
      const expected = mockSearchResultsFromSG;
      const actual = parser.parseSearchPage(5);
      expect(actual).toEqual(expected);
    });
  });

  describe("parseBookPage", () => {
    beforeEach(() => {
      const mockUrl =
        "https://app.thestorygraph.com/books/9fd55617-3c71-458c-ad60-2d963964c351";
      const data = String(readFileSync(SAMPLE_DIR_PATH + MOCK_BOOK_PAGE));
      parser = new StorygraphParser(mockUrl, data);
    });

    it("should return a book object", () => {
      const expected = mockBookResultFromSG;
      const actual = parser.parseBookPage();
      expect(actual).toEqual(expected);
    });
  });
});
