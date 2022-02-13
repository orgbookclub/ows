import { GoodreadsParser } from './goodreadsParser';
import { readFileSync } from 'fs';

describe('GoodreadsParser', () => {
    let goodreadsParser: GoodreadsParser;

    beforeEach(() => {
        const data = String(readFileSync('src/goodreads/samples/search.html'));
        goodreadsParser = new GoodreadsParser(data);
    });
    describe('parseSearchPage', () => {
        it('should return a list of books', () => {
            const expected = [{ "title": "American Gods (American Gods, #1)", "authors": [{ "name": "Neil Gaiman", "url": "https://www.goodreads.com/author/show/1221698.Neil_Gaiman" }], "url": "https://www.goodreads.com/book/show/30165203-american-gods" }, { "title": "Anansi Boys (American Gods, #2)", "authors": [{ "name": "Neil Gaiman", "url": "https://www.goodreads.com/author/show/1221698.Neil_Gaiman" }], "url": "https://www.goodreads.com/book/show/2744.Anansi_Boys" }, { "title": "Filthy Gods (American Gods, #0.5)", "authors": [{ "name": "R. Scarlett", "url": "https://www.goodreads.com/author/show/15254222.R_Scarlett" }], "url": "https://www.goodreads.com/book/show/39296064-filthy-gods" }, { "title": "The Monarch of the Glen (American Gods, #1.1)", "authors": [{ "name": "Neil Gaiman", "url": "https://www.goodreads.com/author/show/1221698.Neil_Gaiman" }], "url": "https://www.goodreads.com/book/show/18245822-the-monarch-of-the-glen" }, { "title": "Rich Boys Don't Have Hearts (American Gods, #1)", "authors": [{ "name": "R. Scarlett", "url": "https://www.goodreads.com/author/show/15254222.R_Scarlett" }], "url": "https://www.goodreads.com/book/show/35077930-rich-boys-don-t-have-hearts" }];
            const actual = goodreadsParser.parseSearchPage(5);
            expect(actual).toEqual(expected);
        });
    });
});
