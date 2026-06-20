import { HttpModule, HttpService } from "@nestjs/axios";
import { ServiceUnavailableException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { of, throwError } from "rxjs";

import {
  mockOLSearchApiResponse,
  mockOLWorkApiResponse,
  mockOLRatingsApiResponse,
  mockOLWorkSearchApiResponse,
  mockOLAltEditionSearchApiResponse,
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
        if (url.includes("/search.json")) {
          return of({ data: mockOLWorkSearchApiResponse } as any);
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

    it("should prefer the representative edition cover and median page count.", async () => {
      jest.spyOn(httpService, "get").mockImplementation((url: string) => {
        if (url.includes("/ratings.json")) {
          return of({ data: mockOLRatingsApiResponse } as any);
        }
        if (url.includes("/search.json")) {
          return of({ data: mockOLAltEditionSearchApiResponse } as any);
        }
        if (url.includes("/authors/") && url.endsWith(".json")) {
          return of({ data: { name: "Neil Gaiman" } } as any);
        }
        return of({ data: mockOLWorkApiResponse } as any);
      });
      const actual = await service.getBook(
        "https://openlibrary.org/works/OL679360W",
      );
      expect(actual.coverUrl).toEqual(
        "https://covers.openlibrary.org/b/id/12345-L.jpg",
      );
      expect(actual.numPages).toEqual(320);
    });

    it("should fall back to the work cover and zero pages when no edition is found.", async () => {
      jest.spyOn(httpService, "get").mockImplementation((url: string) => {
        if (url.includes("/ratings.json")) {
          return of({ data: mockOLRatingsApiResponse } as any);
        }
        if (url.includes("/search.json")) {
          return of({ data: { numFound: 0, docs: [] } } as any);
        }
        if (url.includes("/authors/") && url.endsWith(".json")) {
          return of({ data: { name: "Neil Gaiman" } } as any);
        }
        return of({ data: mockOLWorkApiResponse } as any);
      });
      const actual = await service.getBook(
        "https://openlibrary.org/works/OL679360W",
      );
      expect(actual.coverUrl).toEqual(
        "https://covers.openlibrary.org/b/id/8494659-L.jpg",
      );
      expect(actual.numPages).toEqual(0);
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
        if (url.includes("/search.json")) {
          return of({ data: mockOLWorkSearchApiResponse } as any);
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
        if (url.includes("/search.json")) {
          return of({ data: mockOLWorkSearchApiResponse } as any);
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

  describe("resilience", () => {
    beforeEach(() => {
      jest.spyOn(service as any, "delay").mockResolvedValue(undefined);
    });

    it("should send a descriptive User-Agent header.", async () => {
      const getSpy = jest
        .spyOn(httpService, "get")
        .mockImplementation(() => of({ data: mockOLSearchApiResponse } as any));
      await service.searchBooks("american gods", 5);
      expect(getSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "User-Agent": expect.stringContaining("OrgBookClub-OWS"),
          }),
        }),
      );
    });

    it("should retry transient failures and eventually succeed.", async () => {
      let calls = 0;
      const failure = throwError(() => ({ response: { status: 503 } }));
      jest.spyOn(httpService, "get").mockImplementation(() => {
        calls++;
        if (calls === 1) {
          return failure;
        }
        return of({ data: mockOLSearchApiResponse } as any);
      });
      const actual = await service.searchBooks("american gods", 5);
      expect(actual).toEqual(mockSearchResultsFromOL);
      expect(calls).toBe(2);
    });

    it("should throw a ServiceUnavailableException after exhausting retries.", async () => {
      const failure = throwError(() => ({ response: { status: 500 } }));
      jest.spyOn(httpService, "get").mockImplementation(() => failure);
      await expect(service.searchBooks("american gods", 5)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it("should not retry non-retryable client errors.", async () => {
      let calls = 0;
      const failure = throwError(() => ({ response: { status: 400 } }));
      jest.spyOn(httpService, "get").mockImplementation(() => {
        calls++;
        return failure;
      });
      await expect(service.searchBooks("american gods", 5)).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(calls).toBe(1);
    });
  });
});
