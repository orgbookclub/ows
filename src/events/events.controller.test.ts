import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { BooksService } from "../books/books.service";
import { EventRepository } from "../repositories/event.repository";
import { MockRepository } from "../repositories/mock.repository";
import { UsersService } from "../users/users.service";
import { mockEventDocs } from "../utils/mockEventValues";

import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";

describe("EventsController", () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: BooksService,
          useValue: null,
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

    controller = module.get<EventsController>(EventsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findOne", () => {
    it("should return an event", async () => {
      const actual = await controller.findOne(mockEventDocs[0]._id);
      expect(actual).toEqual(mockEventDocs[0]);
    });

    it("should throw NotFoundException if no event found", async () => {
      const validButAbsentId = "507f1f77bcf86cd799439099";
      await expect(controller.findOne(validButAbsentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
