import { InternalServerErrorException } from '@nestjs/common';
import { Author, Book, GoodreadsBook } from '../models/book.dto';
import { Parser } from './parser';

export class GoodreadsParser extends Parser {

  constructor(url: string, body: any) {
    super(url, body);
  }

  parseSearchPage(k: number): Book[] {
    try {
      const tableRows = this.soup('table[class=tableList]')
        .children('tbody')
        .children('tr');
      const bookList: Array<Book> = [];
      for (let i = 0; i < Math.min(tableRows.length, k); i++) {
        const book = this.parseSearchResult(this.soup(tableRows[i]));
        bookList.push(book);
      }
      return bookList;
    }
    catch {
      throw new InternalServerErrorException();
    }
  }

  parseBookPage(): GoodreadsBook {
    try {
      const coverUrl = this.soup('img[id=coverImage]').attr('src');
      const metaCol = this.soup('div #metacol');
      const { titleText, seriesText } = this.extractTitleAndSeries(metaCol);
      const authors = this.extractAuthors(metaCol.find('a[class=authorName]'));
      const { avgRating, numRatings, numReviews } =
        this.extractBookMetaInfo(metaCol);
      const description = this.extractDescription(metaCol);
      const numPages = this.extractPages(metaCol);
      const genres = this.extractGenres();
      return {
        title: titleText,
        url: this.url,
        series: seriesText,
        authors: authors,
        coverUrl: coverUrl,
        avgRating: avgRating,
        numRatings: numRatings,
        numReviews: numReviews,
        description: description,
        numPages: numPages,
        genres: genres,
      };
    }
    catch {
      throw new InternalServerErrorException();
    }
  }

  parseSearchResult(result): Book {
    const td = result.find('td[width=100%]');
    const url = this.extractUrl(td.children('a'));
    const title = this.extractTitle(td.children('a'));
    const authors = this.extractAuthors(td.find('a[class=authorName]'));
    return {
      title: title,
      authors: authors,
      url: url,
    };
  }

  parseQuotesPage(k: number) {
    try {
      const quotes = [];
      const quoteDivs = this.soup('div[class=quoteText]');
      for (let i = 0; i < Math.min(quoteDivs.length, k); i++) {
        const quote = this.soup(quoteDivs[i]).text().trim();
        quotes.push(quote);
      }
      return quotes;
    }
    catch {
      throw new InternalServerErrorException();
    }
  }

  extractTitle(field) {
    return field.text().trim();
  }

  extractUrl(field) {
    return `https://www.goodreads.com${field.attr('href').split('?')[0]}`;
  }

  extractAuthors(authorArray): Array<Author> {
    const authors: Array<Author> = [];
    for (let i = 0; i < authorArray.length; i++) {
      const author = this.soup(authorArray[i]).text().trim();
      const authorUrl = this.soup(authorArray[i]).attr('href').split('?')[0];
      authors.push({ name: author, url: authorUrl });
    }
    return authors;
  }


  extractBookMetaInfo(metaCol) {
    const bookMeta = metaCol.find('div[id=bookMeta]');
    const avgRating = extractRating();
    const numRatings = extractNumRatings();
    const numReviews = extractNumReviews();
    return { avgRating, numRatings, numReviews };

    function extractNumReviews() {
      try {
        return parseInt(bookMeta.find('meta[itemprop=reviewCount]').attr('content'));
      }
      catch {
        return 0;
      }
    }

    function extractNumRatings() {
      try {
        return parseInt(bookMeta.find('meta[itemprop=ratingCount]').attr('content'));
      }
      catch {
        return 0;
      }
    }

    function extractRating() {
      try {
        return parseFloat(bookMeta.find('span[itemprop=ratingValue]').text().trim());
      }
      catch {
        return 0;
      }
    }
  }

  extractDescription(metaCol) {
    try {
      return metaCol
        .find('div[id=description]')
        .children('span')
        .last()
        .text()
        .trim();
    }
    catch {
      return "No description available";
    }
  }

  extractPages(metaCol): number {
    try {
      const pageStr = metaCol.find('span[itemprop=numberOfPages]').text();
      return parseInt(pageStr.split(' ')[0]);
    }
    catch {
      return 0;
    }
  }

  extractGenres() {
    try {
      const genres = [];
      const genreList = this.soup("a[class='actionLinkLite bookPageGenreLink']");
      for (let i = 0; i < genreList.length; i++) {
        const genre = this.soup(genreList[i]).text();
        genres.push(genre);
      }
      return genres;
    }
    catch {
      return [];
    }
  }

  extractTitleAndSeries(metaCol) {
    const titleText = metaCol.find('h1[id=bookTitle]').text().trim();
    const seriesText = metaCol.find('h2[id=bookSeries]').text().trim();
    return { titleText, seriesText };
  }
}
