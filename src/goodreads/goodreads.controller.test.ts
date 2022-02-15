import { Test } from '@nestjs/testing';
import { GoodreadsController } from './goodreads.controller';
import { GoodreadsService } from './goodreads.service';

describe('GoodreadsController', () => {
  let goodreadsController: GoodreadsController;
  let goodreadsService: GoodreadsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GoodreadsController],
      providers: [GoodreadsService],
    }).compile();

    goodreadsService = moduleRef.get<GoodreadsService>(GoodreadsService);
    goodreadsController =
      moduleRef.get<GoodreadsController>(GoodreadsController);
  });

  describe('getSearch', () => {
    it('should return a list of books', async () => {
      const expected = [
        {
          title: 'American Gods (American Gods, #1)',
          authors: [
            {
              name: 'Neil Gaiman',
              url: 'https://www.goodreads.com/author/show/1221698.Neil_Gaiman',
            },
          ],
          url: 'https://www.goodreads.com/book/show/30165203-american-gods',
        },
        {
          title: 'Anansi Boys (American Gods, #2)',
          authors: [
            {
              name: 'Neil Gaiman',
              url: 'https://www.goodreads.com/author/show/1221698.Neil_Gaiman',
            },
          ],
          url: 'https://www.goodreads.com/book/show/2744.Anansi_Boys',
        },
        {
          title: 'Filthy Gods (American Gods, #0.5)',
          authors: [
            {
              name: 'R. Scarlett',
              url: 'https://www.goodreads.com/author/show/15254222.R_Scarlett',
            },
          ],
          url: 'https://www.goodreads.com/book/show/39296064-filthy-gods',
        },
        {
          title: 'The Monarch of the Glen (American Gods, #1.1)',
          authors: [
            {
              name: 'Neil Gaiman',
              url: 'https://www.goodreads.com/author/show/1221698.Neil_Gaiman',
            },
          ],
          url: 'https://www.goodreads.com/book/show/18245822-the-monarch-of-the-glen',
        },
        {
          title: "Rich Boys Don't Have Hearts (American Gods, #1)",
          authors: [
            {
              name: 'R. Scarlett',
              url: 'https://www.goodreads.com/author/show/15254222.R_Scarlett',
            },
          ],
          url: 'https://www.goodreads.com/book/show/35077930-rich-boys-don-t-have-hearts',
        },
      ];
      jest
        .spyOn(goodreadsService, 'searchBooks')
        .mockImplementation(async () => expected);
      const actual = await goodreadsController.searchBooks('american gods', 5);
      expect(actual).toEqual(expected);
    });
  });

  describe('getBook', () => {
    it('should return a book object', async () => {
      const expectedList = [
        {
          title: 'American Gods (American Gods, #1)',
          authors: [
            {
              name: 'Neil Gaiman',
              url: 'https://www.goodreads.com/author/show/1221698.Neil_Gaiman',
            },
          ],
          url: 'https://www.goodreads.com/book/show/30165203-american-gods',
        },
        {
          title: 'Anansi Boys (American Gods, #2)',
          authors: [
            {
              name: 'Neil Gaiman',
              url: 'https://www.goodreads.com/author/show/1221698.Neil_Gaiman',
            },
          ],
          url: 'https://www.goodreads.com/book/show/2744.Anansi_Boys',
        },
        {
          title: 'Filthy Gods (American Gods, #0.5)',
          authors: [
            {
              name: 'R. Scarlett',
              url: 'https://www.goodreads.com/author/show/15254222.R_Scarlett',
            },
          ],
          url: 'https://www.goodreads.com/book/show/39296064-filthy-gods',
        },
        {
          title: 'The Monarch of the Glen (American Gods, #1.1)',
          authors: [
            {
              name: 'Neil Gaiman',
              url: 'https://www.goodreads.com/author/show/1221698.Neil_Gaiman',
            },
          ],
          url: 'https://www.goodreads.com/book/show/18245822-the-monarch-of-the-glen',
        },
        {
          title: "Rich Boys Don't Have Hearts (American Gods, #1)",
          authors: [
            {
              name: 'R. Scarlett',
              url: 'https://www.goodreads.com/author/show/15254222.R_Scarlett',
            },
          ],
          url: 'https://www.goodreads.com/book/show/35077930-rich-boys-don-t-have-hearts',
        },
      ];
      const expected = {
        title: 'American Gods',
        url: 'https://www.goodreads.com/book/show/30165203-american-gods',
        series: '(American Gods)',
        authors: [
          {
            name: 'Neil Gaiman',
            url: 'https://www.goodreads.com/author/show/1221698.Neil_Gaiman',
          },
        ],
        coverUrl:
          'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1462924585l/30165203.jpg',
        avgRating: 4.11,
        numRatings: 831358,
        numReviews: 41763,
        description:
          "Days before his release from prison, Shadow's wife, Laura, dies in a mysterious car crash. Numbly, he makes his way back home. On the plane, he encounters the enigmatic Mr Wednesday, who claims to be a refugee from a distant war, a former god and the king of America. Together they embark on a profoundly strange journey across the heart of the USA, whilst all around them a storm of preternatural and epic proportions threatens to break.Scary, gripping and deeply unsettling, American Gods takes a long, hard look into the soul of America. You'll be surprised by what - and who - it finds there...",
        numPages: 635,
        genres: [
          'Fantasy',
          'Fiction',
          'Fantasy',
          'Urban Fantasy',
          'Fantasy',
          'Mythology',
          'Audiobook',
          'Science Fiction',
          'Science Fiction Fantasy',
          'Adult',
          'Contemporary',
          'Horror',
        ],
      };
      jest
        .spyOn(goodreadsService, 'searchBooks')
        .mockImplementation(async () => expectedList);
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
      const expected = [
        '“Be yourself; everyone else is already taken.”\n    ―\n  \n    Oscar Wilde',
        "“I'm selfish, impatient and a little insecure. I make mistakes, I am out of control and at times hard to handle. But if you can't handle me at my worst, then you sure as hell don't deserve me at my best.”\n    ―\n  \n    Marilyn Monroe",
        "“Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.”\n    ―\n  \n    Albert Einstein",
        '“So many books, so little time.”\n    ―\n  \n    Frank Zappa',
        '“A room without books is like a body without a soul.”\n    ―\n  \n    Marcus Tullius Cicero',
      ];
      jest
        .spyOn(goodreadsService, 'getQuotes')
        .mockImplementation(async () => expected);
      const actual = await goodreadsController.getQuotes(5);
      expect(actual).toEqual(expected);
    });
  });
});
