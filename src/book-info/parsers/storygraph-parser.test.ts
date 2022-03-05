import { readFileSync } from 'fs';
import { StorygraphParser } from './storygraph-parser';

describe('StorygraphParser', () => {
  let parser: StorygraphParser;
  const SAMPLE_DIR_PATH = 'src/book-info/samples/';
  const MOCK_SEARCH_PAGE = 'sg-search.html';
  const MOCK_BOOK_PAGE = 'sg-book.html';

  describe('parseSearchPage', () => {
    beforeEach(() => {
      const data = String(readFileSync(SAMPLE_DIR_PATH + MOCK_SEARCH_PAGE));
      parser = new StorygraphParser('https://mockurl.com', data);
    });

    it('should return a list of books', () => {
      const expected = [
        {
          title: 'American Gods',
          authors: [
            {
              name: 'Neil Gaiman',
              url: 'https://app.thestorygraph.com/authors/df7894b6-3d99-4dfd-b694-85b5cd4bd97c',
            },
          ],
          url: 'https://app.thestorygraph.com/books/9fd55617-3c71-458c-ad60-2d963964c351',
          genres: [],
        },
        {
          title: 'Anansi Boys',
          authors: [
            {
              name: 'Neil Gaiman',
              url: 'https://app.thestorygraph.com/authors/df7894b6-3d99-4dfd-b694-85b5cd4bd97c',
            },
          ],
          url: 'https://app.thestorygraph.com/books/9d48c469-4f4e-4f2b-861b-d03530c3bb66',
          genres: [],
        },
        {
          title: 'Filthy Gods',
          authors: [
            {
              name: 'R. Scarlett',
              url: 'https://app.thestorygraph.com/authors/1f06415d-2d7e-4b1f-8643-7f79b9175afb',
            },
          ],
          url: 'https://app.thestorygraph.com/books/791ecbd8-9049-42be-a9c7-5213fa4e5c31',
          genres: [],
        },
        {
          title: 'The Monarch of the Glen',
          authors: [
            {
              name: 'Neil Gaiman',
              url: 'https://app.thestorygraph.com/authors/df7894b6-3d99-4dfd-b694-85b5cd4bd97c',
            },
          ],
          url: 'https://app.thestorygraph.com/books/227161ba-1521-48ec-98ac-4c0e150b596b',
          genres: [],
        },
        {
          title: "Rich Boys Don't Have Hearts",
          authors: [
            {
              name: 'R. Scarlett',
              url: 'https://app.thestorygraph.com/authors/1f06415d-2d7e-4b1f-8643-7f79b9175afb',
            },
          ],
          url: 'https://app.thestorygraph.com/books/8df1aab8-7c45-4c36-9d5f-e35279ae5915',
          genres: [],
        },
      ];
      const actual = parser.parseSearchPage(5);
      expect(actual).toEqual(expected);
    });
  });

  describe('parseBookPage', () => {
    beforeEach(() => {
      const mockUrl =
        'https://app.thestorygraph.com/books/9fd55617-3c71-458c-ad60-2d963964c351';
      const data = String(readFileSync(SAMPLE_DIR_PATH + MOCK_BOOK_PAGE));
      parser = new StorygraphParser(mockUrl, data);
    });

    it('should return a book object', () => {
      const expected = {
        title: 'American Gods',
        url: 'https://app.thestorygraph.com/books/9fd55617-3c71-458c-ad60-2d963964c351',
        series: '',
        authors: [
          {
            name: 'Neil Gaiman',
            url: 'https://app.thestorygraph.com/authors/df7894b6-3d99-4dfd-b694-85b5cd4bd97c',
          },
        ],
        coverUrl:
          'https://images.thestorygraph.com/yb51m9d8kpr0i3rga9u7yxb4qvzu',
        avgRating: 4.05,
        warnings:
          'Graphic\n          Death, Sexual content, Violence\n          Moderate\n          Child death, Racial slurs, Colonisation\n          Minor\n          Car accident',
        moods: [
          'adventurous(83%)',
          'mysterious(72%)',
          'dark(67%)',
          'tense(27%)',
          'funny(24%)',
          'reflective(23%)',
          'challenging(19%)',
          'emotional(15%)',
          'sad(6%)',
          'hopeful(5%)',
          'informative(5%)',
          'inspiring(3%)',
          'lighthearted(1%)',
          'relaxing(1%)',
        ],
        pace: ['slow(50%)', 'medium(42%)', 'fast(6%)'],
        quesAns: [
          {
            question: 'Plot- or character-driven?',
            answer: 'A mix: 54% | Character: 24% | Plot: 20%',
          },
          {
            question: 'Strong character development?',
            answer: "Yes: 61% | It's complicated: 21% | No: 16% | N/A: 1%",
          },
          {
            question: 'Loveable characters?',
            answer: "It's complicated: 44% | Yes: 35% | No: 19%",
          },
          {
            question: 'Diverse cast of characters?',
            answer: "Yes: 84% | It's complicated: 10% | No: 4%",
          },
          {
            question: 'Flaws of characters a main focus?',
            answer: "Yes: 49% | No: 24% | It's complicated: 22% | N/A: 3%",
          },
        ],
        description:
          "Description\n                Days before his release from prison, Shadow's wife, Laura, dies in a mysterious car crash. Numbly, he makes his way back home. On the plane, he encounters the enigmatic Mr Wednesday, who claims to be a refugee from a distant war, a former god and ...\n                Read more\n            \n        Description\n          Days before his release from prison, Shadow's wife, Laura, dies in a mysterious car crash. Numbly, he makes his way back home. On the plane, he encounters the enigmatic Mr Wednesday, who claims to be a refugee from a distant war, a former god and ...\n          Read more",
        genres: ['fiction', 'fantasy', 'adventurous', 'dark', 'slow-paced'],
      };
      const actual = parser.parseBookPage();
      expect(actual).toEqual(expected);
    });
  });
});
