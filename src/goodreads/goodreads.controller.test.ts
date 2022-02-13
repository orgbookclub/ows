import { Test } from "@nestjs/testing";
import { GoodreadsController } from "./goodreads.controller";
import { GoodreadsService } from "./goodreads.service";

describe('GoodreadsController', () => {
    let goodreadsController: GoodreadsController;
    let goodreadsService: GoodreadsService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ GoodreadsController ],
            providers: [ GoodreadsService ]
        }).compile();

        goodreadsService = moduleRef.get<GoodreadsService>(GoodreadsService);
        goodreadsController = moduleRef.get<GoodreadsController>(GoodreadsController);
    })

    describe('searchBooks', () => {
        it('should return a list of books', async () => {
            
        });
    });

});