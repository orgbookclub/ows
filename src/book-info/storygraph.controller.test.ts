import { HttpModule } from "@nestjs/axios";
import { Test } from "@nestjs/testing";

import {
  mockSearchResultsFromSG,
  mockBookResultFromSG,
} from "../utils/mockBookValues";

import { StorygraphController } from "./storygraph.controller";
import { StorygraphService } from "./storygraph.service";

describe("StorygraphController", () => {
  let storygraphController: StorygraphController;
  let storygraphService: StorygraphService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [StorygraphController],
      providers: [StorygraphService],
    }).compile();

    storygraphService = moduleRef.get<StorygraphService>(StorygraphService);
    storygraphController =
      moduleRef.get<StorygraphController>(StorygraphController);
  });

  describe("searchBooks", () => {
    it("should return a list of books", async () => {
      const expected = mockSearchResultsFromSG;
      jest
        .spyOn(storygraphService, "searchBooks")
        .mockImplementation(async () => expected);
      const actual = await storygraphController.searchBooks("american gods", 5);
      expect(actual).toEqual(expected);
    });
  });

  describe("searchAndGetBook", () => {
    it("should return a book object", async () => {
      const expected = mockBookResultFromSG;
      jest
        .spyOn(storygraphService, "searchBooks")
        .mockImplementation(async () => mockSearchResultsFromSG);
      jest
        .spyOn(storygraphService, "getBook")
        .mockImplementation(async () => expected);
      const actual =
        await storygraphController.searchAndGetBook("american gods");
      expect(actual).toEqual(expected);
    });

    it("should throw an exception if no books are found", async () => {
      jest
        .spyOn(storygraphService, "searchBooks")
        .mockImplementation(async () => []);
      await expect(
        storygraphController.searchAndGetBook("mock invalid query"),
      ).rejects.toThrow("Could not find a book by that query");
    });
  });
});
