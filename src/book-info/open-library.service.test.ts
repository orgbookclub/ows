import { HttpModule, HttpService } from "@nestjs/axios";
import { Test } from "@nestjs/testing";
import { of } from "rxjs";

import {
  mockOLSearchApiResponse,
  mockOLWorkApiResponse,
  mockOLRatingsApiResponse,
  mockSearchResultsFromOL,
  mockBookResultFromOL,
} from "../utils/mockBookValues";

import { OpenLibraryService } from "./open-library.service";

describe("OpenLibraryService", () => {
  let service: OpenLibraryService;
  let httpService: HttpService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [OpenLibraryService],
    }).compile();

    service = moduleRef.get<OpenLibraryService>(OpenLibraryService);
    httpService = moduleRef.get<HttpService>(HttpService);
  });

  describe("searchBooks", () => {
    it("should return a list of books.", async () => {
      jest
        .spyOn(httpService, "get")
        .mockImplementation(() => of({ data: mockOLSearchApiResponse } as any));
      const actual = await service.searchBooks("american gods", 5);
      expect(actual).toEqual(mockSearchResultsFromOL);
    });

    it("should return an empty list when no results are found.", async () => {
      jest
        .spyOn(httpService, "get")
        .mockImplementation(() =>
          of({ data: { numFound: 0, docs: [] } } as any),
        );
      const actual = await service.searchBooks("nonexistent book xyz", 5);
      expect(actual).toEqual([]);
    });
  });

  describe("getBook", () => {
    it("should return a book object.", async () => {
      jest.spyOn(httpService, "get").mockImplementation((url: string) => {
        if (url.includes("/ratings.json")) {
          return of({ data: mockOLRatingsApiResponse } as any);
        }
        if (url.includes("/authors/") && url.endsWith(".json")) {
          return of({ data: { name: "Neil Gaiman" } } as any);
        }
        return of({ data: mockOLWorkApiResponse } as any);
      });
      const actual = await service.getBook(
        "https://openlibrary.org/works/OL679360W",
      );
      expect(actual).toEqual(mockBookResultFromOL);
    });

    it("should throw an error for invalid URLs.", async () => {
      await expect(
        service.getBook("https://invalid-url.com/book/123"),
      ).rejects.toThrow("Invalid URL");
    });

    it("should handle description as an object with a value key.", async () => {
      const workWithObjectDesc = {
        ...mockOLWorkApiResponse,
        description: { type: "/type/text", value: "Object description" },
      };
      jest.spyOn(httpService, "get").mockImplementation((url: string) => {
        if (url.includes("/ratings.json")) {
          return of({ data: mockOLRatingsApiResponse } as any);
        }
        if (url.includes("/authors/") && url.endsWith(".json")) {
          return of({ data: { name: "Neil Gaiman" } } as any);
        }
        return of({ data: workWithObjectDesc } as any);
      });
      const actual = await service.getBook(
        "https://openlibrary.org/works/OL679360W",
      );
      expect(actual.description).toEqual("Object description");
    });

    it("should handle missing description.", async () => {
      const workNoDesc = { ...mockOLWorkApiResponse, description: undefined };
      jest.spyOn(httpService, "get").mockImplementation((url: string) => {
        if (url.includes("/ratings.json")) {
          return of({ data: mockOLRatingsApiResponse } as any);
        }
        if (url.includes("/authors/") && url.endsWith(".json")) {
          return of({ data: { name: "Neil Gaiman" } } as any);
        }
        return of({ data: workNoDesc } as any);
      });
      const actual = await service.getBook(
        "https://openlibrary.org/works/OL679360W",
      );
      expect(actual.description).toEqual("No description available");
    });

    it("should throw an error for empty work ID.", async () => {
      await expect(
        service.getBook("https://openlibrary.org/works/"),
      ).rejects.toThrow("Invalid URL");
    });
  });
});
