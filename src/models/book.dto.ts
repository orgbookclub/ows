export class Author {
  name: string;
  url: string;
}

export class Book {
  title: string;
  authors: Array<Author>;
  url: string;
}

export class GoodreadsBook extends Book {
  series: string;
  coverUrl: string;
  avgRating: number;
  numRatings: number;
  numReviews: number;
  description: string;
  numPages: number;
  genres: Array<string>;
}

export class StorygraphBook extends Book {
  series: string;
  coverUrl: string;
  avgRating: number;
  warnings: string;
  moods: Array<string>;
  pace: Array<string>;
  quesAns: Array<[string, string]>;
}