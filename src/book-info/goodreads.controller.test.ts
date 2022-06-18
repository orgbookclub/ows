import { HttpModule } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { GoodreadsController } from './goodreads.controller';
import { GoodreadsService } from './goodreads.service';
import {
  mockSearchResultsFromGR,
  mockBookResultFromGR,
  mockQuoteResultsFromGR,
} from '../utils/mockValues';

describe('GoodreadsController', () => {
  let goodreadsController: GoodreadsController;
  let goodreadsService: GoodreadsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [GoodreadsController],
      providers: [GoodreadsService],
    }).compile();

    goodreadsService = moduleRef.get<GoodreadsService>(GoodreadsService);
    goodreadsController =
      moduleRef.get<GoodreadsController>(GoodreadsController);
  });

  describe('searchBooks', () => {
    it('should return a list of books', async () => {
      const expected = mockSearchResultsFromGR;
      jest
        .spyOn(goodreadsService, 'searchBooks')
        .mockImplementation(async () => expected);
      const actual = await goodreadsController.searchBooks('american gods', 5);
      expect(actual).toEqual(expected);
    });
  });

  describe('searchAndG  etBook', () => {
    it('should return a book object', async () => {
      const expected = mockBookResultFromGR;
      jest
        .spyOn(goodreadsService, 'searchBooks')
        .mockImplementation(async () => mockSearchResultsFromGR);
      jest
        .spyOn(goodreadsService, 'getBook')
        .mockImplementation(async () => expected);
      const actual = await goodreadsController.searchAndGetBook(
        'american gods',
      );
      expect(actual).toEqual(expected);
    });

    it('should throw an exception if no books are found', async () => {
      jest
        .spyOn(goodreadsService, 'searchBooks')
        .mockImplementation(async () => []);
      await expect(
        goodreadsController.searchAndGetBook('mock invalid query'),
      ).rejects.toThrow('Could not find a book by that query');
    });
  });

  describe('getQuotes', () => {
    it('should return a list of quotes', async () => {
      const expected = mockQuoteResultsFromGR;
      jest
        .spyOn(goodreadsService, 'getQuotes')
        .mockImplementation(async () => expected);
      const actual = await goodreadsController.getQuotes(5);
      expect(actual).toEqual(expected);
    });
  });
});
