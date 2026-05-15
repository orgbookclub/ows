import { Test, TestingModule } from "@nestjs/testing";

import { BooksService } from "../books/books.service";
import { EventRepository } from "../repositories/event.repository";
import { MockRepository } from "../repositories/mock.repository";
import { UsersService } from "../users/users.service";
import { mockBook } from "../utils/mockBookValues";
import { mockEvent, mockEventDocs } from "../utils/mockEventValues";

import { EventsService } from "./events.service";

describe("EventsService", () => {
  let service: EventsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BooksService,
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            findBookByUrl: async (url: string) => {
              return null;
            },
            createBookFromUrl: async (url: string) => {
              return mockBook("new book", [], url);
            },
          },
        },
        {
          provide: UsersService,
          useValue: null,
        },
        {
          provide: EventRepository,
          useValue: new MockRepository<Event>(mockEventDocs),
        },
        EventsService,
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an event", async () => {
      const event = mockEvent("new mock event");
      const actual = await service.create(event);
      expect(actual).toEqual({ _id: "mock random uuid", ...event });
    });
  });

  describe("findOne", () => {
    it("should return an event", async () => {
      const actual = await service.findOne(mockEventDocs[0]._id);
      expect(actual).toEqual(mockEventDocs[0]);
    });

    it("should return null if no book found", async () => {
      const randId = "randId";
      const actual = await service.findOne(randId);
      expect(actual).toBeUndefined();
    });
  });

  describe("update", () => {
    it("should update the name of the event", async () => {
      await service.update(mockEventDocs[0]._id, { name: "updated name" });
      const updatedEvent = await service.findOne(mockEventDocs[0]._id);
      expect(updatedEvent.name).toEqual("updated name");
    });
  });

  describe("remove", () => {
    it("should delete the event", async () => {
      const id = mockEventDocs[0]._id;
      await service.remove(id);
      const book = await service.findOne(id);
      expect(book).toBeUndefined();
    });
  });

  describe("findManyV2", () => {
    it("returns a paginated wrapper with the requested page and page size", async () => {
      const actual = await service.findManyV2(
        {},
        { mode: "none", topLevelFields: new Set() },
        undefined,
        { page: 1, pageSize: 2 },
      );

      expect(actual.page).toBe(1);
      expect(actual.pageSize).toBe(2);
      expect(actual.total).toBe(mockEventDocs.length);
      expect(actual.items.length).toBe(2);
    });

    it("forwards the inclusion projection and skips populates outside it", async () => {
      const repo: any = (service as any).repository;
      const spy = jest.spyOn(repo, "findPaginated");

      await service.findManyV2(
        {},
        {
          mode: "include",
          topLevelFields: new Set(["name", "status"]),
          selectString: "name status",
        },
        undefined,
        { page: 1, pageSize: 5 },
      );

      const populatePaths = spy.mock.calls[0][3];
      expect(populatePaths).toEqual([]);
      expect(spy.mock.calls[0][2]).toBe("name status");
    });

    it("includes only the requested populates in inclusion mode", async () => {
      const repo: any = (service as any).repository;
      const spy = jest.spyOn(repo, "findPaginated");

      await service.findManyV2(
        {},
        {
          mode: "include",
          topLevelFields: new Set(["book", "leaders"]),
          selectString: "book leaders",
        },
        undefined,
        { page: 1, pageSize: 5 },
      );

      expect(spy.mock.calls[0][3]).toEqual(["book", "leaders.user"]);
    });

    it("excludes only the listed populates in exclusion mode", async () => {
      const repo: any = (service as any).repository;
      const spy = jest.spyOn(repo, "findPaginated");

      await service.findManyV2(
        {},
        {
          mode: "exclude",
          topLevelFields: new Set(["interested", "readers"]),
          selectString: "-interested -readers",
        },
        undefined,
        { page: 1, pageSize: 5 },
      );

      expect(spy.mock.calls[0][3]).toEqual([
        "book",
        "requestedBy.user",
        "leaders.user",
      ]);
    });

    it("forwards every populate path when no projection is requested", async () => {
      const repo: any = (service as any).repository;
      const spy = jest.spyOn(repo, "findPaginated");

      await service.findManyV2(
        {},
        { mode: "none", topLevelFields: new Set() },
        undefined,
        { page: 1, pageSize: 5 },
      );

      expect(spy.mock.calls[0][3]).toEqual([
        "book",
        "requestedBy.user",
        "readers.user",
        "leaders.user",
        "interested.user",
      ]);
    });

    it("forwards the validated sort key", async () => {
      const repo: any = (service as any).repository;
      const spy = jest.spyOn(repo, "findPaginated");

      await service.findManyV2(
        {},
        { mode: "none", topLevelFields: new Set() },
        "endDateAsc" as any,
        { page: 1, pageSize: 5 },
      );

      expect(spy.mock.calls[0][1]).toBe("endDateAsc");
    });
  });
});
