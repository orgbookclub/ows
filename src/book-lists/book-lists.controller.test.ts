import { Test, TestingModule } from "@nestjs/testing";

import { BookListsController } from "./book-lists.controller";
import { BookListsService } from "./book-lists.service";

describe("BookListsController", () => {
  let controller: BookListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookListsController],
      providers: [BookListsService],
    }).compile();

    controller = module.get<BookListsController>(BookListsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
