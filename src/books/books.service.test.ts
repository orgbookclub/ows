import { Test, TestingModule } from '@nestjs/testing';
import { BookRepository } from '../repositories/book.repository';
import { MockRepository } from '../repositories/mock.repository';
import { BooksService } from './books.service';
import {
  mockBookDocs,
  mockBook,
  mockAuthors,
  mockBooks,
} from '../utils/mockBookValues';
import { Book } from './schemas/book.schema';

describe('BooksService', () => {
  let service: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BookRepository,
          useValue: new MockRepository<Book>(mockBookDocs),
        },
        BooksService,
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      const book = mockBook(
        'new book title',
        [mockAuthors[0]],
        'https://new-url.com',
        [],
      );
      const actual = await service.createBook(book);
      expect(actual).toEqual({ _id: 'mock random uuid', ...book });
    });

    it('should throw an error if we try to create a book that already exists ', async () => {
      await expect(service.createBook(mockBook())).rejects.toThrow(
        'Book already exists!',
      );
    });
  });

  describe('findAll', () => {
    it('should return all books', async () => {
      const actual = await service.getAllBooks();
      expect(actual).toEqual(mockBookDocs);
    });
  });

  describe('findOne', () => {
    it('should return a book', async () => {
      const actual = await service.getBook(mockBookDocs[0]._id);
      expect(actual).toEqual(mockBookDocs[0]);
    });

    it('should return null if no book found', async () => {
      const actual = await service.getBook('random id');
      expect(actual).toBeUndefined();
    });
  });
  describe('findByUrl', () => {
    it('should return a book with that url', async () => {
      const actual = await service.findBookByUrl(mockBooks[1].url);
      expect(actual).toEqual(mockBookDocs[1]);
    });

    it('should return null if no book found', async () => {
      const actual = await service.findBookByUrl('random url');
      expect(actual).toEqual(null);
    });
  });

  describe('update', () => {
    it('should update the title of the book', async () => {
      await service.updateBook(mockBookDocs[0]._id, { title: 'updated title' });
      const updatedBook = await service.getBook(mockBookDocs[0]._id);
      expect(updatedBook.title).toEqual('updated title');
    });
  });

  describe('remove', () => {
    it('should delete the book', async () => {
      const id = mockBookDocs[0]._id;
      await service.deleteBook(id);
      const book = await service.getBook(id);
      expect(book).toBeUndefined();
    });
  });
});
