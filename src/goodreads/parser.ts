import cheerio, { CheerioAPI } from "cheerio";

export class Parser {
    soup: CheerioAPI;

    constructor(body) {
        this.soup = cheerio.load(body);
        console.log('Loaded HTML for parsing');
    }
}