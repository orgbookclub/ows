import { AuthorDto } from "../books/dto/author.dto";
import { BookDto } from "../books/dto/book.dto";

const mockAuthor = (
  name = "mock author",
  url = "mock author url",
): AuthorDto => ({
  name: name,
  url: url,
});

/**
 * Creates a mock bookDto object.
 *
 * @param title Title of the book.
 * @param authors List of authors.
 * @param url The url.
 * @param genres List of genres.
 * @returns A Book Dto object.
 */
export const mockBook = (
  title = "mock title",
  authors: AuthorDto[] = [mockAuthor()],
  url = "https://mock-url.com?suffix",
  genres: string[] = ["Mock genre 1", "Mock genre 2"],
): BookDto => ({
  title: title,
  authors: authors,
  url: url,
  genres: genres,
  coverUrl: "",
});

export const mockAuthors = [
  mockAuthor(),
  mockAuthor("mock author2", "url2"),
  mockAuthor("mock author3", "url3"),
];
export const mockBooks = [
  mockBook(),
  mockBook("mock title 2", [mockAuthors[1]], "https://mock-url2.com", []),
  mockBook("mock title3", [mockAuthors[2]], "httsp://mock-url3.com", [
    "mock genre3",
  ]),
];
export const mockBookDocs = [
  { _id: "uuid", ...mockBooks[0] },
  { _id: "uuid2", ...mockBooks[1] },
  { _id: "uuid3", ...mockBooks[2] },
];

export const mockSearchResultsFromGR = [
  {
    title: "American Gods (American Gods, #1)",
    authors: [
      {
        name: "Neil Gaiman",
        url: "https://www.goodreads.com/author/show/1221698.Neil_Gaiman",
      },
    ],
    url: "https://www.goodreads.com/book/show/30165203-american-gods",
    genres: [],
    coverUrl:
      "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1462924585i/30165203._SY75_.jpg",
  },
  {
    title: "Anansi Boys (American Gods, #2)",
    authors: [
      {
        name: "Neil Gaiman",
        url: "https://www.goodreads.com/author/show/1221698.Neil_Gaiman",
      },
    ],
    url: "https://www.goodreads.com/book/show/2744.Anansi_Boys",
    genres: [],
    coverUrl:
      "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1479778049i/2744._SY75_.jpg",
  },
  {
    title: "Filthy Gods (American Gods, #0.5)",
    authors: [
      {
        name: "R. Scarlett",
        url: "https://www.goodreads.com/author/show/15254222.R_Scarlett",
      },
    ],
    url: "https://www.goodreads.com/book/show/39296064-filthy-gods",
    genres: [],
    coverUrl:
      "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1524841918i/39296064._SY75_.jpg",
  },
  {
    title: "The Monarch of the Glen (American Gods, #1.1)",
    authors: [
      {
        name: "Neil Gaiman",
        url: "https://www.goodreads.com/author/show/1221698.Neil_Gaiman",
      },
    ],
    url: "https://www.goodreads.com/book/show/18245822-the-monarch-of-the-glen",
    genres: [],
    coverUrl:
      "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1394083799i/18245822._SY75_.jpg",
  },
  {
    title: "Rich Boys Don't Have Hearts (American Gods, #1)",
    authors: [
      {
        name: "R. Scarlett",
        url: "https://www.goodreads.com/author/show/15254222.R_Scarlett",
      },
    ],
    url: "https://www.goodreads.com/book/show/35077930-rich-boys-don-t-have-hearts",
    genres: [],
    coverUrl:
      "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1524172321i/35077930._SX50_.jpg",
  },
];
export const mockBookResultFromGR = {
  title: "American Gods",
  url: "https://www.goodreads.com/book/show/30165203-american-gods",
  series: "American Gods #1",
  authors: [
    {
      name: "Neil Gaiman",
      url: "https://www.goodreads.com/author/show/1221698.Neil_Gaiman",
    },
  ],
  coverUrl:
    "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1462924585i/30165203.jpg",
  avgRating: 4.11,
  numRatings: 871415,
  numReviews: 43963,
  description:
    "Days before his release from prison, Shadow's wife, Laura, dies in a mysterious car crash. Numbly, he makes his way back home. On the plane, he encounters the enigmatic Mr Wednesday, who claims to be a refugee from a distant war, a former god and the king of America. Together they embark on a profoundly strange journey across the heart of the USA, whilst all around them a storm of preternatural and epic proportions threatens to break.Scary, gripping and deeply unsettling, American Gods takes a long, hard look into the soul of America. You'll be surprised by what - and who - it finds there...",
  numPages: 635,
  genres: [
    "Fantasy",
    "Fiction",
    "Mythology",
    "Urban Fantasy",
    "Audiobook",
    "Science Fiction",
    "Science Fiction Fantasy",
  ],
};
export const mockQuoteResultsFromGR = [
  "“Be yourself; everyone else is already taken.”\n    ―\n  \n    Oscar Wilde",
  "“I'm selfish, impatient and a little insecure. I make mistakes, I am out of control and at times hard to handle. But if you can't handle me at my worst, then you sure as hell don't deserve me at my best.”\n    ―\n  \n    Marilyn Monroe",
  "“Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.”\n    ―\n  \n    Albert Einstein",
  "“So many books, so little time.”\n    ―\n  \n    Frank Zappa",
  "“A room without books is like a body without a soul.”\n    ―\n  \n    Marcus Tullius Cicero",
];

export const mockSearchResultsFromSG = [
  {
    title: "American Gods",
    authors: [
      {
        name: "Neil Gaiman",
        url: "https://app.thestorygraph.com/authors/df7894b6-3d99-4dfd-b694-85b5cd4bd97c",
      },
    ],
    url: "https://app.thestorygraph.com/books/9fd55617-3c71-458c-ad60-2d963964c351",
    genres: [],
    coverUrl: "https://images.thestorygraph.com/yb51m9d8kpr0i3rga9u7yxb4qvzu",
  },
  {
    title: "Anansi Boys",
    authors: [
      {
        name: "Neil Gaiman",
        url: "https://app.thestorygraph.com/authors/df7894b6-3d99-4dfd-b694-85b5cd4bd97c",
      },
    ],
    url: "https://app.thestorygraph.com/books/9d48c469-4f4e-4f2b-861b-d03530c3bb66",
    genres: [],
    coverUrl: "https://images.thestorygraph.com/3cjv5mjgxw9q22hky0bt2k3bi8hn",
  },
  {
    title: "Filthy Gods",
    authors: [
      {
        name: "R. Scarlett",
        url: "https://app.thestorygraph.com/authors/1f06415d-2d7e-4b1f-8643-7f79b9175afb",
      },
    ],
    url: "https://app.thestorygraph.com/books/791ecbd8-9049-42be-a9c7-5213fa4e5c31",
    genres: [],
    coverUrl: "https://images.thestorygraph.com/5ojfg9hztunqhoja90b607rpaest",
  },
  {
    title: "The Monarch of the Glen",
    authors: [
      {
        name: "Neil Gaiman",
        url: "https://app.thestorygraph.com/authors/df7894b6-3d99-4dfd-b694-85b5cd4bd97c",
      },
    ],
    url: "https://app.thestorygraph.com/books/227161ba-1521-48ec-98ac-4c0e150b596b",
    genres: [],
    coverUrl: "https://images.thestorygraph.com/t9ouflib4r0s5ackmzza6k0u6r0q",
  },
  {
    title: "Rich Boys Don't Have Hearts",
    authors: [
      {
        name: "R. Scarlett",
        url: "https://app.thestorygraph.com/authors/1f06415d-2d7e-4b1f-8643-7f79b9175afb",
      },
    ],
    url: "https://app.thestorygraph.com/books/8df1aab8-7c45-4c36-9d5f-e35279ae5915",
    genres: [],
    coverUrl: "https://images.thestorygraph.com/zt6dan7ie0hgkdz1pdxyouk1zqf5",
  },
];
export const mockBookResultFromSG = {
  title: "American Gods",
  url: "https://app.thestorygraph.com/books/9fd55617-3c71-458c-ad60-2d963964c351",
  series: "American Gods #1",
  authors: [
    {
      name: "Neil Gaiman",
      url: "https://app.thestorygraph.com/authors/df7894b6-3d99-4dfd-b694-85b5cd4bd97c",
    },
  ],
  coverUrl: "https://cdn.thestorygraph.com/yb51m9d8kpr0i3rga9u7yxb4qvzu",
  avgRating: 4.05,
  warnings:
    "Graphic\n          Death, Sexual content, Violence\n          Moderate\n          Child death, Racial slurs, Slavery\n          Minor\n          Car accident",
  moods: [
    "adventurous(83%)",
    "mysterious(73%)",
    "dark(66%)",
    "tense(26%)",
    "reflective(25%)",
    "funny(23%)",
    "challenging(20%)",
    "emotional(17%)",
    "sad(7%)",
    "hopeful(5%)",
    "informative(5%)",
    "inspiring(4%)",
    "lighthearted(2%)",
    "relaxing(1%)",
  ],
  pace: ["slow(51%)", "medium(42%)", "fast(5%)"],
  quesAns: [
    {
      question: "Plot- or character-driven?",
      answer: "A mix: 55% | Plot: 22% | Character: 21%",
    },
    {
      question: "Strong character development?",
      answer: "Yes: 62% | It's complicated: 21% | No: 15%",
    },
    {
      question: "Loveable characters?",
      answer: "It's complicated: 41% | Yes: 37% | No: 20%",
    },
    {
      question: "Diverse cast of characters?",
      answer: "Yes: 85% | It's complicated: 10% | No: 4%",
    },
    {
      question: "Flaws of characters a main focus?",
      answer: "Yes: 51% | It's complicated: 23% | No: 22% | N/A: 2%",
    },
  ],
  description:
    "Description\n                Days before his release from prison, Shadow's wife, Laura, dies in a mysterious car crash. Numbly, he makes his way back home. On the plane, he encounters the enigmatic Mr Wednesday, who claims to be a refugee from a distant war, a former god and ...\n                Read more\n            \n        Description\n          Days before his release from prison, Shadow's wife, Laura, dies in a mysterious car crash. Numbly, he makes his way back home. On the plane, he encounters the enigmatic Mr Wednesday, who claims to be a refugee from a distant war, a former god and ...\n          Read more",
  genres: [
    "fiction",
    "fantasy",
    "adventurous",
    "dark",
    "mysterious",
    "slow-paced",
  ],
};
