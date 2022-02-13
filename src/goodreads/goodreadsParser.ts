import cheerio, { CheerioAPI } from 'cheerio';
import { Book } from '../models/book.dto';

export class GoodreadsParser {
  soup: CheerioAPI;

  constructor(body: any) {
    this.soup = cheerio.load(body);
    console.log('Loaded HTML for parsing');
  }

  parseSearchPage(k: number): Book[] {
    const tableRows = this.soup('table[class=tableList]')
      .children('tbody')
      .children('tr');
    const res = [];
    for (let i = 0; i < Math.min(tableRows.length, k); i++) {
      const cleanResult = this.parseSearchResult(this.soup(tableRows[i]));
      res.push(cleanResult);
    }
    return res;
  }

  extractTitle(field) {
    return field.text().trim();
  }

  extractUrl(field) {
    return field.attr('href').split('?')[0];
  }

  extractAuthors(authorArray) {
    const authors = [];
    for (let i = 0; i < authorArray.length; i++) {
      const author = this.soup(authorArray[i]).text().trim();
      const authorUrl = this.soup(authorArray[i]).attr('href').split('?')[0];
      authors.push({ name: author, url: authorUrl });
    }
    return authors;
  }
  parseSearchResult(result) {
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

  parseBookPage() {
    const coverUrl = this.soup('img[id=coverImage]').attr('src');
    const metaCol = this.soup('div #metacol');
    const { titleText, seriesText } = this.extractTitleAndSeries(metaCol);
    const authors = this.extractAuthors(metaCol.find('div[id=bookAuthors]'));
    const { avgRating, numRatings, numReviews } =
      this.extractBookMetaInfo(metaCol);
    const description = this.extractDescription(metaCol);
    const numPages = this.extractPages(metaCol);
    const genres = this.extractGenres();
    return {
      title: titleText,
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

  extractBookMetaInfo(metaCol) {
    const bookMeta = metaCol.find('div[id=bookMeta]');
    const avgRating = bookMeta.find('span[itemprop=ratingValue]').text().trim();
    const numRatings = bookMeta
      .find('meta[itemprop=ratingCount]')
      .attr('content');
    const numReviews = bookMeta
      .find('meta[itemprop=reviewCount]')
      .attr('content');
    return { avgRating, numRatings, numReviews };
  }

  extractDescription(metaCol) {
    return metaCol
      .find('div[id=description]')
      .children('span')
      .last()
      .text()
      .trim();
  }

  extractPages(metaCol) {
    return metaCol.find('span[itemprop=numberOfPages]').text();
  }

  extractGenres() {
    const genres = [];
    const genreList = this.soup("a[class='actionLinkLite bookPageGenreLink']");
    for (let i = 0; i < genreList.length; i++) {
      const genre = this.soup(genreList[i]).text();
      genres.push(genre);
    }
    return genres;
  }

  extractTitleAndSeries(metaCol) {
    const titleText = metaCol.find('h1[id=bookTitle]').text().trim();
    const seriesText = metaCol.find('h2[id=bookSeries]').text().trim();
    return { titleText, seriesText };
  }

  parseQuotePage(k) {
    const quotes = [];
    const quoteDivs = this.soup('div[class=quoteText]');
    for (let i = 0; i < Math.min(quoteDivs.length, k); i++) {
      const quote = this.soup(quoteDivs[i]).text().trim();
      quotes.push(quote);
    }
    return quotes;
  }
}
