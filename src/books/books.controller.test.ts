import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { BookRepository } from '../repositories/book.repository';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BookDto } from './dto/book.dto';
import { Book, BookSchema } from './schemas/book.schema';

const mockAuthor = (name = 'mock author', url = 'mock author url') => ({
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
const allBooks = [
  mockBook(),
  mockBook('mock title 2'),
  mockBook(
    'mock title 3',
    [{ name: 'mock author2', url: 'mock url' }],
    'mock book url',
    ['mock genre 3'],
  ),
];

describe('BooksController', () => {
  let controller: BooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: getModelToken(Book.name),
          useValue: BookSchema,
        },
        {
          provide: BooksService,
          useValue: {
            create: jest
              .fn()
              .mockImplementation((book: BookDto) =>
                Promise.resolve({ _id: 'a uuid', ...book }),
              ),
            findAll: jest
              .fn()
              .mockImplementation(() => Promise.resolve(allBooks)),
          },
        },
        BookRepository,
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', () => {
      const newBookDto: BookDto = {
        title: 'title',
        authors: [
          { name: 'author name', url: 'https://author.url.com?suffix' },
        ],
        url: 'https://bookurl.com',
        genres: [],
      };
      expect(controller.create(newBookDto)).resolves.toEqual({
        _id: 'a uuid',
        ...newBookDto,
      });
    });
  });

  describe('findAll', () => {
    it('should get all books', () => {
      expect(controller.findAll()).resolves.toEqual(allBooks);
    });
  });
});
