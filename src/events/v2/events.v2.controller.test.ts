import { Test, TestingModule } from "@nestjs/testing";

import { BooksService } from "../../books/books.service";
import { EventRepository } from "../../repositories/event.repository";
import { MockRepository } from "../../repositories/mock.repository";
import { UsersService } from "../../users/users.service";
import { mockEventDocs } from "../../utils/mockEventValues";
import { EventsService } from "../events.service";

import { EventsV2Controller } from "./events.v2.controller";

describe("EventsV2Controller", () => {
  let controller: EventsV2Controller;
  let repository: MockRepository<unknown>;

  beforeEach(async () => {
    repository = new MockRepository<unknown>([...mockEventDocs]);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsV2Controller],
      providers: [
        { provide: BooksService, useValue: null },
        { provide: UsersService, useValue: null },
        { provide: EventRepository, useValue: repository },
        EventsService,
      ],
    }).compile();

    controller = module.get<EventsV2Controller>(EventsV2Controller);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("find", () => {
    it("returns a paginated wrapper with defaults applied", async () => {
      const actual = await controller.find({}, {}, {}, {});

      expect(actual.page).toBe(1);
      expect(actual.pageSize).toBe(20);
      expect(actual.total).toBe(mockEventDocs.length);
      expect(actual.items.length).toBe(mockEventDocs.length);
    });

    it("applies the requested pagination", async () => {
      const actual = await controller.find(
        {},
        {},
        {},
        { page: 2 as unknown as number, pageSize: 1 as unknown as number },
      );

      expect(actual.page).toBe(2);
      expect(actual.pageSize).toBe(1);
      expect(actual.items.length).toBe(1);
      expect(actual.total).toBe(mockEventDocs.length);
    });

    it("forwards the projection through to the repository", async () => {
      const spy = jest.spyOn(repository, "findPaginated");
      await controller.find({}, { fields: "name,status" }, {}, {});

      expect(spy).toHaveBeenCalledWith(
        expect.any(Object),
        undefined,
        "name status",
        [],
        1,
        20,
      );
    });

    it("forwards the sort key through to the repository", async () => {
      const spy = jest.spyOn(repository, "findPaginated");
      await controller.find({}, {}, { sortBy: "startDateAsc" as never }, {});

      expect(spy).toHaveBeenCalledWith(
        expect.any(Object),
        "startDateAsc",
        undefined,
        expect.any(Array),
        1,
        20,
      );
    });

    it("rejects an invalid sort key with 400", async () => {
      await expect(
        controller.find({}, {}, { sortBy: "nope" as never }, {}),
      ).rejects.toThrow();
    });

    it("rejects an out-of-range pageSize with 400", async () => {
      await expect(
        controller.find({}, {}, {}, { pageSize: 200 as unknown as number }),
      ).rejects.toThrow();
    });

    it("rejects mixed inclusion/exclusion in projection with 400", async () => {
      await expect(
        controller.find({}, { fields: "name,-description" }, {}, {}),
      ).rejects.toThrow();
    });
  });
});
