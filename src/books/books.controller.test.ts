import { Test, TestingModule } from '@nestjs/testing';
import { BookRepository } from '../repositories/book.repository';
import { MockRepository } from '../repositories/mock.repository';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { mockAuthors, mockBook, mockBookDocs } from '../utils/mockBookValues';
import { Book } from './schemas/book.schema';
import { BookInfoModule } from '../book-info/book-info.module';

describe('BooksController', () => {
  let controller: BooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BookInfoModule],
      controllers: [BooksController],
      providers: [
        {
          provide: BookRepository,
          useValue: new MockRepository<Book>(mockBookDocs),
        },
        BooksService,
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBookFromDto', () => {
    it('should create a book', async () => {
      const book = mockBook(
        'new book title',
        [mockAuthors[0]],
        'https://new-url.com',
        [],
      );
      const actual = await controller.createBookFromDto(book);
      expect(actual).toEqual({ _id: 'mock random uuid', ...book });
    });
  });
});
