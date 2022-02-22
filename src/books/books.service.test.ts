import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { BookRepository } from '../repositories/book.repository';
import { BooksService } from './books.service';
import { AuthorDto } from './dto/author.dto';
import { Book, BookDocument } from './schemas/book.schema';

const mockAuthor = (
  name = 'mock author',
  url = 'mock author url',
): AuthorDto => ({
  name: name,
  url: url,
});
const mockBook = (
  title = 'mock title',
  authors = [mockAuthor()],
  url = 'https://mock-url.com?suffix',
  genres = ['Mock genre 1', 'Mock genre 2'],
): Book => ({
  title: title,
  authors: authors,
  url: url,
  genres: genres,
});

describe('BooksService', () => {
  let service: BooksService;
  let model: Model<BookDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Book.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockBook()),
            constructor: jest.fn().mockResolvedValue(mockBook()),
            find: jest.fn(),
            findOne: jest.fn(),
            getAll: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
        BooksService,
        BookRepository,
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    model = module.get<Model<BookDocument>>(getModelToken(Book.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
      jest.spyOn(model, 'create').mockImplementationOnce(() =>
        Promise.resolve({
          _id: 'a uuid',
          ...mockBook(),
        }),
      );
      const actual = await service.create(mockBook());
      expect(actual).toEqual({
        _id: 'a uuid',
        ...mockBook(),
      });
    });

    it('should throw an error if we try to create a book that already exists ', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockBook()]),
      } as any);
      await expect(service.create(mockBook())).rejects.toThrow(
        'Book already exists!',
      );
    });
  });

  describe('findAll', () => {
    it('should return all books', async () => {
      const allBooks = [mockBook(), mockBook('mock book 2')];
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(allBooks),
      } as any);
      const actual = await service.findAll();
      expect(actual).toEqual(allBooks);
    });
  });

  describe('findByUrl', () => {
    it('should return a book with that url', async () => {
      const book = mockBook();
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([book]),
      } as any);
      const actual = await service.findByUrl(book.url);
      expect(actual).toEqual([book]);
    });

    it('should return an empty array if not found', async () => {
      const book = mockBook();
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
      const actual = await service.findByUrl(book.url);
      expect(actual).toEqual([]);
    });

    it('should throw an error if multiple books found', async () => {
      const book = mockBook();
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([book, mockBook()]),
      } as any);
      await expect(service.findByUrl(book.url)).rejects.toThrow(
        'Multiple books found',
      );
    });
  });
});
