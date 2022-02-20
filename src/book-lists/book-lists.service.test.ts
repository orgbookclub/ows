import { Test, TestingModule } from '@nestjs/testing';
import { BookListsService } from './book-lists.service';

describe('BookListsService', () => {
  let service: BookListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookListsService],
    }).compile();

    service = module.get<BookListsService>(BookListsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
