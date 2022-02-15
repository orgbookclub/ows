import cheerio, { CheerioAPI } from "cheerio";

export class Parser {
    url: string;
    soup: CheerioAPI;

    constructor(url, body) {
        this.url = url;
        this.soup = cheerio.load(body);
    }
}