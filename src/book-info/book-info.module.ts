import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { GoodreadsController } from "./goodreads.controller";
import { GoodreadsService } from "./goodreads.service";
import { OpenLibraryController } from "./open-library.controller";
import { OpenLibraryService } from "./open-library.service";
import { StorygraphController } from "./storygraph.controller";
import { StorygraphService } from "./storygraph.service";

/**
 * Module for fetching Book information from external sources like Goodreads, Storygraph & Open Library.
 */
@Module({
  imports: [HttpModule],
  controllers: [
    GoodreadsController,
    StorygraphController,
    OpenLibraryController,
  ],
  providers: [GoodreadsService, StorygraphService, OpenLibraryService],
  exports: [GoodreadsService, StorygraphService, OpenLibraryService],
})
export class BookInfoModule {}
