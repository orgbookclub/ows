import { HttpModule } from "@nestjs/axios";
import { Test } from "@nestjs/testing";

import {
  mockSearchResultsFromOL,
  mockBookResultFromOL,
} from "../utils/mockBookValues";

import { OpenLibraryController } from "./open-library.controller";
import { OpenLibraryService } from "./open-library.service";

describe("OpenLibraryController", () => {
  let controller: OpenLibraryController;
  let service: OpenLibraryService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [OpenLibraryController],
      providers: [OpenLibraryService],
    }).compile();

    service = moduleRef.get<OpenLibraryService>(OpenLibraryService);
    controller = moduleRef.get<OpenLibraryController>(OpenLibraryController);
  });

  describe("searchBooks", () => {
    it("should return a list of books.", async () => {
      const expected = mockSearchResultsFromOL;
      jest
        .spyOn(service, "searchBooks")
        .mockImplementation(async () => expected);
      const actual = await controller.searchBooks("american gods", 5);
      expect(actual).toEqual(expected);
    });

    it("should throw an exception if no books are found.", async () => {
      jest.spyOn(service, "searchBooks").mockImplementation(async () => []);
      await expect(
        controller.searchBooks("mock invalid query", 5),
      ).rejects.toThrow("Could not find a book by that query");
    });
  });

  describe("searchAndGetBook", () => {
    it("should return a book object.", async () => {
      const expected = mockBookResultFromOL;
      jest
        .spyOn(service, "searchBooks")
        .mockImplementation(async () => mockSearchResultsFromOL);
      jest.spyOn(service, "getBook").mockImplementation(async () => expected);
      const actual = await controller.searchAndGetBook("american gods");
      expect(actual).toEqual(expected);
    });

    it("should throw an exception if no books are found.", async () => {
      jest.spyOn(service, "searchBooks").mockImplementation(async () => []);
      await expect(
        controller.searchAndGetBook("mock invalid query"),
      ).rejects.toThrow("Could not find a book by that query");
    });
  });
});
