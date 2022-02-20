import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { BookRepository } from '../repositories/book.repository';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BookDto } from './dto/book.dto';
import { Book, BookSchema } from './schemas/book.schema';

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
});
