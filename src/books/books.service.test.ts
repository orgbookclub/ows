import { Test, TestingModule } from '@nestjs/testing';
import { BookRepository } from '../repositories/book.repository';
import { MockRepository } from '../repositories/mock.repository';
import { BooksService } from './books.service';
import { AuthorDto } from './dto/author.dto';
import { Book } from './schemas/book.schema';

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
const mockAuthors = [
  mockAuthor(),
  mockAuthor('mock author2', 'url2'),
  mockAuthor('mock author3', 'url3'),
];
const mockBooks = [
  mockBook(),
  mockBook('mock title 2', [mockAuthors[1]], 'https://mock-url2.com', []),
  mockBook('mock title3', [mockAuthors[2]], 'httsp://mock-url3.com', [
    'mock genre3',
  ]),
];
const mockBookDocs = [
  { _id: 'uuid', ...mockBooks[0] },
  { _id: 'uuid2', ...mockBooks[1] },
  { _id: 'uuid3', ...mockBooks[2] },
];
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
      const actual = await service.create(book);
      expect(actual).toEqual({ _id: 'mock random uuid', ...book });
    });

    it('should throw an error if we try to create a book that already exists ', async () => {
      await expect(service.create(mockBook())).rejects.toThrow(
        'Book already exists!',
      );
    });
  });

  describe('findAll', () => {
    it('should return all books', async () => {
      const actual = await service.findAll();
      expect(actual).toEqual(mockBookDocs);
    });
  });

  describe('findOne', () => {
    it('should return a book', async () => {
      const actual = await service.findOne(mockBookDocs[0]._id);
      expect(actual).toEqual(mockBookDocs[0]);
    });

    it('should return null if no book found', async () => {
      const actual = await service.findOne('random id');
      expect(actual).toBeUndefined();
    });
  });
  describe('findByUrl', () => {
    it('should return a book with that url', async () => {
      const actual = await service.findByUrl(mockBooks[1].url);
      expect(actual).toEqual([mockBookDocs[1]]);
    });

    it('should return an empty array if not found', async () => {
      const actual = await service.findByUrl('random url');
      expect(actual).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update the title of the book', async () => {
      await service.update(mockBookDocs[0]._id, { title: 'updated title' });
      const updatedBook = await service.findOne(mockBookDocs[0]._id);
      expect(updatedBook.title).toEqual('updated title');
    });
  });

  describe('remove', () => {
    it('should delete the book', async () => {
      const id = mockBookDocs[0]._id;
      await service.remove(id);
      const book = await service.findOne(id);
      expect(book).toBeUndefined();
    });
  });
});
