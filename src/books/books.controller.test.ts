import { Test, TestingModule } from '@nestjs/testing';
import { BookRepository } from '../repositories/book.repository';
import { MockRepository } from '../repositories/mock.repository';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import {
  mockAuthors,
  mockBook,
  mockBookDocs,
  mockBookResultFromGR,
  mockBookResultFromSG,
  mockSearchResultsFromGR,
  mockSearchResultsFromSG,
} from '../utils/mockBookValues';
import { Book } from './schemas/book.schema';
import { GoodreadsService } from '../book-info/goodreads.service';
import { StorygraphService } from '../book-info/storygraph.service';
import { BookInfoModule } from '../book-info/book-info.module';

describe('BooksController', () => {
  let controller: BooksController;
  let goodreadsService: GoodreadsService;
  let storygraphService: StorygraphService;
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

    goodreadsService = module.get<GoodreadsService>(GoodreadsService);
    storygraphService = module.get<StorygraphService>(StorygraphService);
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

  describe('createBookFromUrl', () => {
    it('should create a book from GR', async () => {
      const sampleUrl =
        'https://www.goodreads.com/book/show/30165203-american-gods';
      jest
        .spyOn(goodreadsService, 'searchBooks')
        .mockImplementation(async () => mockSearchResultsFromGR);
      jest
        .spyOn(goodreadsService, 'getBook')
        .mockImplementation(async () => mockBookResultFromGR);
      const actual = await controller.createBookFromUrl(sampleUrl);
      expect(actual).toEqual({
        _id: 'mock random uuid',
        ...mockBookResultFromGR,
      });
    });

    it('should create a book from SG', async () => {
      const sampleUrl =
        'https://app.thestorygraph.com/books/9fd55617-3c71-458c-ad60-2d963964c351';
      jest
        .spyOn(storygraphService, 'searchBooks')
        .mockImplementation(async () => mockSearchResultsFromSG);
      jest
        .spyOn(storygraphService, 'getBook')
        .mockImplementation(async () => mockBookResultFromSG);

      const actual = await controller.createBookFromUrl(sampleUrl);
      expect(actual).toEqual({
        _id: 'mock random uuid',
        ...mockBookResultFromSG,
      });
    });
  });
});
